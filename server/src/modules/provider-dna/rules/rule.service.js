/**
 * Rule Service
 *
 * @module signalforge/server/modules/provider-dna/rules/service
 */

import { RuleRepository } from './rule.repository.js';
import { RuleMatcherService } from './rule-matcher.service.js';
import { DnaRepository } from '../dna.repository.js';
import { DnaRuleNotFoundError } from '../dna.errors.js';
import {
  emitDnaRuleCreated,
  emitDnaRuleUpdated,
  emitDnaRuleDeleted,
} from '../dna.events.js';

export class RuleService {
  constructor(repository = null, dnaRepository = null) {
    this.repository = repository || new RuleRepository();
    this.dnaRepository = dnaRepository || new DnaRepository();
    this.matcher = new RuleMatcherService();
  }

  async create(providerId, payload) {
    let dna = await this.dnaRepository.findDnaByProviderId(providerId);
    if (!dna) {
      dna = await this.dnaRepository.createDna({ providerId, version: '1.0.0' });
    }
    const created = await this.repository.create({
      dnaId: dna.id,
      providerId,
      ruleType: payload.ruleType,
      matchType: payload.matchType || 'CONTAINS',
      pattern: payload.pattern,
      caseSensitive: payload.caseSensitive === true,
      priority: payload.priority ?? 100,
      action: payload.action,
      confidence: payload.confidence ?? 0.9,
      enabled: payload.enabled !== false,
    });
    await emitDnaRuleCreated(providerId, created.id, created.rule_type);
    return this.serialize(created);
  }

  async getById(providerId, ruleId) {
    const rule = await this.repository.findById(ruleId);
    if (!rule || rule.provider_id !== providerId) {
      throw new DnaRuleNotFoundError();
    }
    return this.serialize(rule);
  }

  async list(providerId, filters) {
    const rules = await this.repository.listByProvider(providerId, filters);
    return rules.map((r) => this.serialize(r));
  }

  async listEnabled(providerId) {
    const rules = await this.repository.listEnabledByProvider(providerId);
    return rules.map((r) => this.serialize(r));
  }

  async update(providerId, ruleId, payload) {
    const existing = await this.repository.findById(ruleId);
    if (!existing || existing.provider_id !== providerId) {
      throw new DnaRuleNotFoundError();
    }
    await this.repository.update(ruleId, payload);
    const updated = await this.repository.findById(ruleId);
    await emitDnaRuleUpdated(providerId, ruleId, Object.keys(payload));
    return this.serialize(updated);
  }

  async delete(providerId, ruleId) {
    const existing = await this.repository.findById(ruleId);
    if (!existing || existing.provider_id !== providerId) {
      throw new DnaRuleNotFoundError();
    }
    await this.repository.delete(ruleId);
    await emitDnaRuleDeleted(providerId, ruleId);
    return { deleted: true };
  }

  async matchRules(providerId, text) {
    const rules = await this.repository.listEnabledByProvider(providerId);
    const matched = this.matcher.matchRules(rules, text);
    return this.matcher.sortByPriority(matched).map((r) => this.serialize(r));
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    const action = typeof row.action === 'string' ? JSON.parse(row.action) : row.action;
    return {
      id: row.id,
      providerId: row.provider_id,
      ruleType: row.rule_type,
      matchType: row.match_type,
      pattern: row.pattern,
      caseSensitive: row.case_sensitive,
      priority: row.priority,
      action,
      confidence: row.confidence,
      usageCount: row.usage_count,
      successCount: row.success_count,
      lastUsedAt: row.last_used_at,
      enabled: row.enabled,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export default RuleService;