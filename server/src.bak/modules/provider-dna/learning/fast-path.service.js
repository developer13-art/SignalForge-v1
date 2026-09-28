/**
 * Fast Path Service
 *
 * Applies provider DNA rules to a message before invoking the AI.
 * Returns a parsed signal when a rule produces sufficient confidence.
 *
 * @module signalforge/server/modules/provider-dna/learning/fast-path
 */

import { DnaRepository } from '../dna.repository.js';
import { DNA_RULE_TYPES, DEFAULT_FAST_PATH_MIN_CONFIDENCE } from '../dna.constants.js';
import { getLogger } from '../../../bootstrap/initLogger.js';
import { emitDnaFastPathHit, emitDnaFastPathMiss } from '../dna.events.js';

export class FastPathService {
  constructor(repository = null) {
    this.repository = repository || new DnaRepository();
    this.logger = getLogger('dna-fast-path');
  }

  matchesRule(rule, text) {
    if (!rule || !text) {
      return false;
    }
    const haystack = rule.case_sensitive ? text : text.toLowerCase();
    const needle = rule.case_sensitive ? rule.pattern : rule.pattern.toLowerCase();

    switch (rule.match_type) {
      case 'EXACT':
        return haystack === needle;
      case 'CONTAINS':
        return haystack.includes(needle);
      case 'STARTS_WITH':
        return haystack.startsWith(needle);
      case 'ENDS_WITH':
        return haystack.endsWith(needle);
      case 'REGEX': {
        try {
          const flags = rule.case_sensitive ? '' : 'i';
          return new RegExp(rule.pattern, flags).test(text);
        } catch {
          return false;
        }
      }
      default:
        return false;
    }
  }

  async apply(providerId, message, options = {}) {
    const text = message && typeof message.text === 'string' ? message.text : '';
    if (!text) {
      return { hit: false, reason: 'empty_message' };
    }

    const rules = await this.repository.findEnabledRulesByProvider(providerId);
    if (rules.length === 0) {
      return { hit: false, reason: 'no_rules' };
    }

    const matched = [];
    for (const rule of rules) {
      if (this.matchesRule(rule, text)) {
        matched.push(rule);
      }
    }

    if (matched.length === 0) {
      await emitDnaFastPathMiss(providerId, message.id || null);
      return { hit: false, reason: 'no_match' };
    }

    matched.sort((a, b) => {
      const priorityDelta = (b.priority || 0) - (a.priority || 0);
      if (priorityDelta !== 0) {
        return priorityDelta;
      }
      return (b.confidence || 0) - (a.confidence || 0);
    });

    const topRule = matched[0];
    const minConfidence = options.minConfidence ?? DEFAULT_FAST_PATH_MIN_CONFIDENCE;

    if ((topRule.confidence ?? 0) < minConfidence) {
      return { hit: false, reason: 'below_threshold', rule: topRule };
    }

    const action = typeof topRule.action === 'string'
      ? JSON.parse(topRule.action)
      : topRule.action;

    await this.repository.incrementRuleUsage(topRule.id, true);
    await emitDnaFastPathHit(providerId, message.id || null, topRule.id);

    return {
      hit: true,
      rule: topRule,
      action,
      confidence: topRule.confidence,
    };
  }
}

export default FastPathService;