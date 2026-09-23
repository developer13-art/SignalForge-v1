/**
 * Reinforcement Service
 *
 * Adjusts rule weights based on observed outcomes. Rules that produce
 * correct downstream outcomes gain confidence; rules that miss lose
 * confidence and can be disabled automatically.
 *
 * @module signalforge/server/modules/provider-dna/learning/reinforcement
 */

import {
  MIN_RULE_SUCCESS_RATE,
  MIN_RULE_USAGE_FOR_PROMOTION,
  MAX_RULE_USAGE_MULTIPLIER,
} from '../dna.constants.js';
import { getLogger } from '../../../bootstrap/initLogger.js';
import { emitDnaReinforcementApplied } from '../dna.events.js';

export class ReinforcementService {
  constructor() {
    this.logger = getLogger('dna-reinforcement');
  }

  computeAdjustment(rule) {
    const usage = rule.usage_count || 0;
    const success = rule.success_count || 0;
    if (usage === 0) {
      return 0;
    }
    const successRate = success / usage;
    if (usage >= MIN_RULE_USAGE_FOR_PROMOTION && successRate >= MIN_RULE_SUCCESS_RATE) {
      return 0.02;
    }
    if (successRate < 0.5 && usage >= MIN_RULE_USAGE_FOR_PROMOTION) {
      return -0.05;
    }
    return 0;
  }

  applyToRule(rule) {
    const current = rule.confidence ?? 0.5;
    const adjustment = this.computeAdjustment(rule);
    let next = current + adjustment;
    next = Math.max(0, Math.min(1, next));

    const shouldDisable = rule.usage_count >= MIN_RULE_USAGE_FOR_PROMOTION && next < 0.3;

    return {
      ruleId: rule.id,
      previous: current,
      next: Number(next.toFixed(4)),
      adjustment,
      disabled: shouldDisable,
    };
  }

  async applyBatch(providerId, rules) {
    const results = [];
    for (const rule of rules) {
      const adjustment = this.applyToRule(rule);
      results.push(adjustment);
      await emitDnaReinforcementApplied(providerId, rule.id, adjustment.adjustment);
    }
    return results;
  }

  computePriorityBoost(rule) {
    const usage = rule.usage_count || 0;
    const success = rule.success_count || 0;
    const basePriority = rule.priority ?? 100;
    if (usage === 0) {
      return basePriority;
    }
    const successRate = success / usage;
    const boost = Math.min(Math.floor(usage / MAX_RULE_USAGE_MULTIPLIER), 50);
    return basePriority + Math.round(boost * successRate);
  }
}

export default ReinforcementService;