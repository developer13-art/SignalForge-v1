/**
 * Pattern Learner Service
 *
 * Builds candidate rules from extracted patterns with support counts
 * so that only well-supported patterns are promoted to active rules.
 *
 * @module signalforge/server/modules/provider-dna/learning/pattern-learner
 */

import { DNA_RULE_TYPES, DNA_MATCH_TYPES, DEFAULT_RULE_PRIORITY } from '../dna.constants.js';
import { getLogger } from '../../../bootstrap/initLogger.js';

export class PatternLearnerService {
  constructor() {
    this.logger = getLogger('dna-pattern-learner');
  }

  buildSymbolRules(symbolMappings, autoLearnThreshold) {
    const rules = [];
    for (const [raw, canonical] of Object.entries(symbolMappings || {})) {
      rules.push({
        ruleType: DNA_RULE_TYPES.SYMBOL_MAPPING,
        matchType: DNA_MATCH_TYPES.EXACT,
        pattern: raw,
        caseSensitive: false,
        priority: DEFAULT_RULE_PRIORITY + 10,
        action: { type: 'MAP_SYMBOL', value: canonical },
        confidence: 0.9,
        supportCount: autoLearnThreshold,
      });
    }
    return rules;
  }

  buildAbbreviationRules(abbreviationMappings, autoLearnThreshold) {
    const rules = [];
    for (const [phrase, intent] of Object.entries(abbreviationMappings || {})) {
      rules.push({
        ruleType: DNA_RULE_TYPES.ABBREVIATION,
        matchType: DNA_MATCH_TYPES.CONTAINS,
        pattern: phrase,
        caseSensitive: false,
        priority: DEFAULT_RULE_PRIORITY,
        action: { type: 'MAP_INTENT', value: intent },
        confidence: 0.85,
        supportCount: autoLearnThreshold,
      });
    }
    return rules;
  }

  buildManagementRules(patterns, autoLearnThreshold) {
    const grouped = new Map();
    for (const pattern of patterns || []) {
      const key = `${pattern.pattern.toLowerCase()}|${pattern.intent}`;
      const existing = grouped.get(key) || {
        pattern: pattern.pattern,
        intent: pattern.intent,
        supportCount: 0,
      };
      existing.supportCount++;
      grouped.set(key, existing);
    }

    const rules = [];
    for (const entry of grouped.values()) {
      if (entry.supportCount < autoLearnThreshold) {
        continue;
      }
      rules.push({
        ruleType: DNA_RULE_TYPES.MANAGEMENT_INSTRUCTION,
        matchType: DNA_MATCH_TYPES.CONTAINS,
        pattern: entry.pattern,
        caseSensitive: false,
        priority: DEFAULT_RULE_PRIORITY + 5,
        action: { type: 'MANAGEMENT_INSTRUCTION', value: entry.intent },
        confidence: Math.min(0.95, 0.6 + entry.supportCount * 0.05),
        supportCount: entry.supportCount,
      });
    }
    return rules;
  }

  buildRiskRules(riskStyle) {
    if (!riskStyle) {
      return [];
    }
    return [
      {
        ruleType: DNA_RULE_TYPES.RISK_PATTERN,
        matchType: DNA_MATCH_TYPES.CONTAINS,
        pattern: 'risk',
        caseSensitive: false,
        priority: DEFAULT_RULE_PRIORITY - 5,
        action: { type: 'RISK_STYLE_HINT', value: riskStyle },
        confidence: 0.6,
        supportCount: riskStyle.samples,
      },
    ];
  }

  buildLanguageRules(languageHints) {
    const rules = [];
    for (const [lang, ratio] of Object.entries(languageHints || {})) {
      if (ratio < 0.5) {
        continue;
      }
      rules.push({
        ruleType: DNA_RULE_TYPES.LANGUAGE_HINT,
        matchType: DNA_MATCH_TYPES.EXACT,
        pattern: lang,
        caseSensitive: false,
        priority: DEFAULT_RULE_PRIORITY - 10,
        action: { type: 'LANGUAGE_HINT', value: lang },
        confidence: ratio,
        supportCount: 1,
      });
    }
    return rules;
  }

  learn(extracted, options = {}) {
    const autoLearnThreshold = options.autoLearnThreshold || 5;
    const rules = [
      ...this.buildSymbolRules(extracted.symbolMappings, autoLearnThreshold),
      ...this.buildAbbreviationRules(extracted.abbreviationMappings, autoLearnThreshold),
      ...this.buildManagementRules(extracted.managementPatterns, autoLearnThreshold),
      ...this.buildRiskRules(extracted.riskStyle),
      ...this.buildLanguageRules(extracted.languageHints),
    ];

    return rules.filter((rule) => {
      if (rule.ruleType === DNA_RULE_TYPES.MANAGEMENT_INSTRUCTION) {
        return rule.supportCount >= autoLearnThreshold;
      }
      return true;
    });
  }
}

export default PatternLearnerService;