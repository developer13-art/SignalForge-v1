/**
 * Behavior Feedback Service
 *
 * @module signalforge/server/modules/trade-shadow/behavior-feedback
 */

import { BEHAVIOR_CATEGORIES, DIVERGENCE_TYPES } from './shadow.constants.js';

const CATEGORY_THRESHOLDS = Object.freeze({
  minSamples: 3,
  disciplinedMissedRatio: 0.2,
  impulsiveEarlyExitRatio: 0.5,
  patientLateExitRatio: 0.5,
});

export class BehaviorFeedbackService {
  classify(shadows) {
    if (!Array.isArray(shadows) || shadows.length < CATEGORY_THRESHOLDS.minSamples) {
      return {
        category: null,
        confidence: 0,
        reason: 'INSUFFICIENT_SAMPLES',
      };
    }

    const stats = {
      total: shadows.length,
      missed: 0,
      gained: 0,
      earlyExit: 0,
      lateExit: 0,
      differentPrice: 0,
      partialClose: 0,
    };

    for (const shadow of shadows) {
      const missed = Number(shadow.missed_profit || 0);
      if (missed > 0.01) {
        stats.missed++;
      } else if (missed < -0.01) {
        stats.gained++;
      }
      if (shadow.divergence_type === DIVERGENCE_TYPES.EARLY_EXIT) {
        stats.earlyExit++;
      }
      if (shadow.divergence_type === DIVERGENCE_TYPES.LATE_EXIT) {
        stats.lateExit++;
      }
      if (shadow.divergence_type === DIVERGENCE_TYPES.DIFFERENT_PRICE) {
        stats.differentPrice++;
      }
      if (shadow.divergence_type === DIVERGENCE_TYPES.PARTIAL_CLOSE_DIFF) {
        stats.partialClose++;
      }
    }

    const missedRatio = stats.missed / stats.total;
    const gainedRatio = stats.gained / stats.total;
    const earlyExitRatio = stats.earlyExit / stats.total;
    const lateExitRatio = stats.lateExit / stats.total;

    if (missedRatio <= CATEGORY_THRESHOLDS.disciplinedMissedRatio && gainedRatio >= 0.4) {
      return {
        category: BEHAVIOR_CATEGORIES.DISCIPLINED,
        confidence: Number(Math.min(1, gainedRatio + 0.2).toFixed(4)),
        stats,
      };
    }

    if (earlyExitRatio >= CATEGORY_THRESHOLDS.impulsiveEarlyExitRatio) {
      return {
        category: BEHAVIOR_CATEGORIES.IMPULSIVE,
        confidence: Number(Math.min(1, earlyExitRatio).toFixed(4)),
        stats,
      };
    }

    if (lateExitRatio >= CATEGORY_THRESHOLDS.patientLateExitRatio) {
      return {
        category: BEHAVIOR_CATEGORIES.PATIENT,
        confidence: Number(Math.min(1, lateExitRatio).toFixed(4)),
        stats,
      };
    }

    if (missedRatio >= 0.5) {
      return {
        category: BEHAVIOR_CATEGORIES.AGGRESSIVE,
        confidence: Number(Math.min(1, missedRatio).toFixed(4)),
        stats,
      };
    }

    if (gainedRatio >= 0.5) {
      return {
        category: BEHAVIOR_CATEGORIES.CONSERVATIVE,
        confidence: Number(Math.min(1, gainedRatio).toFixed(4)),
        stats,
      };
    }

    return {
      category: BEHAVIOR_CATEGORIES.CONSISTENT,
      confidence: 0.5,
      stats,
    };
  }

  generateInsights(shadows) {
    const classification = this.classify(shadows);
    const insights = [];

    if (!classification.category) {
      return { classification, insights };
    }

    switch (classification.category) {
      case BEHAVIOR_CATEGORIES.DISCIPLINED:
        insights.push('Your trade management consistently matches provider intent.');
        break;
      case BEHAVIOR_CATEGORIES.IMPULSIVE:
        insights.push('You frequently exit trades earlier than the provider. Consider letting trades run.');
        break;
      case BEHAVIOR_CATEGORIES.PATIENT:
        insights.push('You often hold positions longer than the provider.');
        break;
      case BEHAVIOR_CATEGORIES.AGGRESSIVE:
        insights.push('You miss a significant portion of provider profit. Review your exit strategy.');
        break;
      case BEHAVIOR_CATEGORIES.CONSERVATIVE:
        insights.push('You tend to close trades earlier and take profit. This is a defensive pattern.');
        break;
      case BEHAVIOR_CATEGORIES.CONSISTENT:
        insights.push('Your behavior is consistent but neither strongly conservative nor aggressive.');
        break;
      default:
        break;
    }

    return { classification, insights };
  }
}

export default BehaviorFeedbackService;