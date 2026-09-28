/**
 * Language Profile Service
 *
 * @module signalforge/server/modules/provider-dna/profile/language-profile
 */

import { RuleRepository } from '../rules/rule.repository.js';
import { DNA_RULE_TYPES } from '../dna.constants.js';

export class LanguageProfileService {
  constructor(repository = null) {
    this.repository = repository || new RuleRepository();
  }

  async build(providerId) {
    const rules = await this.repository.listByProvider(providerId, {
      ruleType: DNA_RULE_TYPES.LANGUAGE_HINT,
      enabled: true,
    });
    const languages = {};
    for (const rule of rules) {
      const action = typeof rule.action === 'string' ? JSON.parse(rule.action) : rule.action;
      if (action?.value) {
        languages[action.value] = rule.confidence;
      }
    }
    return {
      providerId,
      languages,
      primaryLanguage: this.getPrimary(languages),
    };
  }

  getPrimary(languages) {
    let primary = null;
    let highest = 0;
    for (const [lang, confidence] of Object.entries(languages)) {
      if (confidence > highest) {
        primary = lang;
        highest = confidence;
      }
    }
    return primary;
  }
}

export default LanguageProfileService;