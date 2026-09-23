/**
 * Rules Engine Service
 *
 * @module signalforge/server/modules/automation/engine/rules-engine
 */

import { getLogger } from '../../../bootstrap/initLogger.js';
import { ConditionEvaluatorService } from './condition-evaluator.service.js';
import { ActionExecutorService } from './action-executor.service.js';
import { RulePriorityService } from './rule-priority.service.js';
import {
  emitEvaluationStarted,
  emitEvaluationCompleted,
  emitRuleTriggered,
  emitRuleMatched,
  emitRuleExecuted,
  emitRuleFailed,
} from '../automation.events.js';

export class RulesEngineService {
  constructor(dependencies = {}) {
    this.logger = getLogger('rules-engine');
    this.conditionEvaluator =
      dependencies.conditionEvaluator || new ConditionEvaluatorService();
    this.actionExecutor = dependencies.actionExecutor || new ActionExecutorService();
    this.priority = dependencies.priority || new RulePriorityService();
    this.repository = dependencies.repository || null;
  }

  async evaluate(rules, context, options = {}) {
    if (!Array.isArray(rules) || rules.length === 0) {
      return { evaluated: 0, matchedCount: 0, triggered: [] };
    }

    await emitEvaluationStarted(context.userId, {
      ruleCount: rules.length,
    });

    const scoped = this.priority.filterByScope(rules, context);
    const sorted = this.priority.sort(scoped);

    const triggered = [];

    for (const rule of sorted) {
      if (options.stopAfterFirstMatch && triggered.length > 0) {
        break;
      }

      const condition = this.parseJson(rule.condition);
      const action = this.parseJson(rule.action);

      let evaluation;
      try {
        evaluation = await this.conditionEvaluator.evaluate(condition, context);
      } catch (error) {
        await emitRuleFailed(context.userId, rule.id, error);
        continue;
      }

      if (!evaluation.matched) {
        continue;
      }

      await emitRuleTriggered(context.userId, rule.id, context);
      await emitRuleMatched(context.userId, rule.id);

      let execution;
      try {
        execution = await this.actionExecutor.execute(action, context);
      } catch (error) {
        await emitRuleFailed(context.userId, rule.id, error);
        await this.persistTrigger(rule.id, context, evaluation, null, false, error.message);
        continue;
      }

      await emitRuleExecuted(context.userId, rule.id, action);
      await this.persistTrigger(rule.id, context, evaluation, execution, true, null);

      triggered.push({
        ruleId: rule.id,
        condition,
        action,
        execution,
      });

      if (rule.stop_on_match) {
        break;
      }
    }

    const result = {
      evaluated: sorted.length,
      matchedCount: triggered.length,
      triggered,
    };

    await emitEvaluationCompleted(context.userId, result);

    return result;
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

  async persistTrigger(ruleId, context, conditionMatched, actionExecuted, success, error) {
    if (!this.repository) {
      return null;
    }
    try {
      return await this.repository.createTrigger({
        ruleId,
        userId: context.userId,
        tradeId: context.tradeId || null,
        signalId: context.signalId || null,
        conditionMatched,
        actionExecuted,
        success,
        error,
      });
    } catch (err) {
      this.logger.error({ err, ruleId }, 'Failed to persist automation trigger');
      return null;
    }
  }
}

export default RulesEngineService;