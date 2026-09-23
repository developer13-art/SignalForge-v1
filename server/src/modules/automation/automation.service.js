/**
 * Automation Service (facade)
 *
 * @module signalforge/server/modules/automation/service
 */

import { AutomationRepository } from './automation.repository.js';
import { RulesEngineService } from './engine/rules-engine.service.js';
import { ConditionEvaluatorService } from './engine/condition-evaluator.service.js';
import { ActionExecutorService } from './engine/action-executor.service.js';
import { RulePriorityService } from './engine/rule-priority.service.js';
import {
  AutomationRuleNotFoundError,
  AutomationRuleLimitExceededError,
} from './automation.errors.js';
import { MAX_RULES_PER_USER } from './automation.constants.js';
import {
  emitRuleCreated,
  emitRuleUpdated,
  emitRuleDeleted,
  emitRuleEnabled,
  emitRuleDisabled,
} from './automation.events.js';

export class AutomationService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new AutomationRepository();
    this.conditionEvaluator =
      dependencies.conditionEvaluator || new ConditionEvaluatorService();
    this.actionExecutor = dependencies.actionExecutor || new ActionExecutorService(dependencies);
    this.priority = dependencies.priority || new RulePriorityService();

    this.engine =
      dependencies.engine ||
      new RulesEngineService({
        conditionEvaluator: this.conditionEvaluator,
        actionExecutor: this.actionExecutor,
        priority: this.priority,
        repository: this.repository,
      });
  }

  async createRule(userId, payload) {
    const count = await this.repository.countRulesForUser(userId);
    if (count >= MAX_RULES_PER_USER) {
      throw new AutomationRuleLimitExceededError();
    }

    const created = await this.repository.createRule({
      userId,
      name: payload.name,
      description: payload.description || null,
      scope: payload.scope || 'GLOBAL',
      providerId: payload.providerId || null,
      symbol: payload.symbol || null,
      condition: payload.condition,
      action: payload.action,
      priority: payload.priority ?? 100,
      enabled: payload.enabled !== false,
      stopOnMatch: payload.stopOnMatch === true,
    });

    await emitRuleCreated(userId, created.id);

    return this.getRuleById(userId, created.id);
  }

  async getRuleById(userId, ruleId) {
    const row = await this.repository.findRuleByIdForUser(ruleId, userId);
    if (!row) {
      throw new AutomationRuleNotFoundError();
    }
    return this.serialize(row);
  }

  async listRules(userId, filters = {}) {
    const rows = await this.repository.listRulesForUser(userId, filters);
    return rows.map((r) => this.serialize(r));
  }

  async updateRule(userId, ruleId, payload) {
    const existing = await this.repository.findRuleByIdForUser(ruleId, userId);
    if (!existing) {
      throw new AutomationRuleNotFoundError();
    }
    await this.repository.updateRule(ruleId, userId, payload);
    const updated = await this.repository.findRuleByIdForUser(ruleId, userId);
    await emitRuleUpdated(userId, ruleId, Object.keys(payload));
    return this.serialize(updated);
  }

  async deleteRule(userId, ruleId) {
    const existing = await this.repository.findRuleByIdForUser(ruleId, userId);
    if (!existing) {
      throw new AutomationRuleNotFoundError();
    }
    await this.repository.deleteRule(ruleId, userId);
    await emitRuleDeleted(userId, ruleId);
    return { deleted: true };
  }

  async enableRule(userId, ruleId) {
    const existing = await this.repository.findRuleByIdForUser(ruleId, userId);
    if (!existing) {
      throw new AutomationRuleNotFoundError();
    }
    await this.repository.updateRule(ruleId, userId, { enabled: true });
    await emitRuleEnabled(userId, ruleId);
    const updated = await this.repository.findRuleByIdForUser(ruleId, userId);
    return this.serialize(updated);
  }

  async disableRule(userId, ruleId) {
    const existing = await this.repository.findRuleByIdForUser(ruleId, userId);
    if (!existing) {
      throw new AutomationRuleNotFoundError();
    }
    await this.repository.updateRule(ruleId, userId, { enabled: false });
    await emitRuleDisabled(userId, ruleId);
    const updated = await this.repository.findRuleByIdForUser(ruleId, userId);
    return this.serialize(updated);
  }

  async evaluateRules(userId, context, options = {}) {
    const rules = await this.repository.listEnabledRulesForUser(userId);
    return this.engine.evaluate(rules, { userId, ...context }, options);
  }

  async listTriggersForRule(userId, ruleId, limit) {
    const existing = await this.repository.findRuleByIdForUser(ruleId, userId);
    if (!existing) {
      throw new AutomationRuleNotFoundError();
    }
    return this.repository.listTriggersForRule(ruleId, limit);
  }

  async listTriggers(userId, filters, pagination) {
    const result = await this.repository.listTriggersForUser(userId, filters, pagination);
    return result;
  }

  async testRule(userId, payload) {
    const result = await this.conditionEvaluator.evaluate(
      payload.condition,
      payload.context || {},
    );
    return result;
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      description: row.description,
      scope: row.scope,
      providerId: row.provider_id,
      symbol: row.symbol,
      condition: this.parseJson(row.condition),
      action: this.parseJson(row.action),
      priority: row.priority,
      enabled: row.enabled,
      stopOnMatch: row.stop_on_match,
      triggerCount: row.trigger_count,
      lastTriggeredAt: row.last_triggered_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  parseJson(input) {
    if (input === null || input === undefined) {
      return null;
    }
    if (typeof input === 'string') {
      try {
        return JSON.parse(input);
      } catch {
        return null;
      }
    }
    return input;
  }
}

export default AutomationService;