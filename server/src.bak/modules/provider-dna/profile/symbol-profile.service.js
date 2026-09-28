/**
 * Symbol Profile Service
 *
 * @module signalforge/server/modules/provider-dna/profile/symbol-profile
 */

import { RuleRepository } from '../rules/rule.repository.js';
import { DNA_RULE_TYPES } from '../dna.constants.js';

export class SymbolProfileService {
  constructor(repository = null) {
    this.repository = repository || new RuleRepository();
  }

  async build(providerId) {
    const rules = await this.repository.listByProvider(providerId, {
      ruleType: DNA_RULE_TYPES.SYMBOL_MAPPING,
      enabled: true,
    });
    const mappings = {};
    const preferredSymbols = new Set();
    for (const rule of rules) {
      const action = typeof rule.action === 'string' ? JSON.parse(rule.action) : rule.action;
      mappings[rule.pattern] = {
        canonical: action?.value || null,
        confidence: rule.confidence,
        usageCount: rule.usage_count,
      };
      if (action?.value) {
        preferredSymbols.add(action.value);
      }
    }
    return {
      providerId,
      mappings,
      preferredSymbols: Array.from(preferredSymbols),
    };
  }
}

export default SymbolProfileService;