/**
 * Abbreviation Service
 *
 * @module signalforge/server/modules/provider-dna/rules/abbreviation
 */

import { RuleRepository } from './rule.repository.js';
import { DNA_RULE_TYPES } from '../dna.constants.js';

export class AbbreviationService {
  constructor(repository = null) {
    this.repository = repository || new RuleRepository();
  }

  async list(providerId) {
    const rules = await this.repository.listByProvider(providerId, {
      ruleType: DNA_RULE_TYPES.ABBREVIATION,
    });
    return rules.map((rule) => this.serialize(rule));
  }

  async add(providerId, phrase, intent, options = {}) {
    const dna = await this.repository.dnaRepository.findDnaByProviderId(providerId);
    if (!dna) {
      throw new Error('Provider DNA not found');
    }
    const created = await this.repository.create({
      dnaId: dna.id,
      providerId,
      ruleType: DNA_RULE_TYPES.ABBREVIATION,
      matchType: 'CONTAINS',
      pattern: phrase,
      caseSensitive: options.caseSensitive === true,
      priority: options.priority ?? 100,
      action: { type: 'MAP_INTENT', value: intent },
      confidence: options.confidence ?? 0.9,
    });
    return this.serialize(created);
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    const action = typeof row.action === 'string' ? JSON.parse(row.action) : row.action;
    return {
      id: row.id,
      phrase: row.pattern,
      intent: action?.value || null,
      confidence: row.confidence,
      enabled: row.enabled,
      createdAt: row.created_at,
    };
  }
}

export default AbbreviationService;