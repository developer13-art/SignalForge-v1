/**
 * Behavior Classifier Service
 *
 * @module signalforge/server/modules/trader-intelligence/classification/behavior-classifier
 */

import { BEHAVIOR_CATEGORIES } from '../intelligence.constants.js';

export class BehaviorClassifierService {
  classify({
    consistencyScore,
    disciplineScore,
    martingale,
    grid,
    recoveryTrading,
    newsExposure,
  }) {
    if (martingale && martingale.detected) {
      return {
        category: BEHAVIOR_CATEGORIES.RECKLESS,
        score: Number(Math.min(1, martingale.score).toFixed(4)),
        reason: 'MARTINGALE_DETECTED',
      };
    }

    if (recoveryTrading && recoveryTrading.detected) {
      return {
        category: BEHAVIOR_CATEGORIES.IMPULSIVE,
        score: Number(Math.min(1, recoveryTrading.score).toFixed(4)),
        reason: 'RECOVERY_TRADING_DETECTED',
      };
    }

    if (newsExposure && newsExposure.detected) {
      return {
        category: BEHAVIOR_CATEGORIES.AGGRESSIVE,
        score: Number(Math.min(1, newsExposure.score).toFixed(4)),
        reason: 'NEWS_OVEREXPOSURE',
      };
    }

    if (grid && grid.detected) {
      return {
        category: BEHAVIOR_CATEGORIES.CONSISTENT,
        score: Number(Math.min(1, grid.score).toFixed(4)),
        reason: 'GRID_TRADING',
      };
    }

    const consistency = Number(consistencyScore || 0);
    const discipline = Number(disciplineScore || 0);
    const composite = (consistency + discipline) / 2;

    if (composite >= 0.8) {
      return {
        category: BEHAVIOR_CATEGORIES.DISCIPLINED,
        score: Number(composite.toFixed(4)),
      };
    }

    if (composite >= 0.6) {
      return {
        category: BEHAVIOR_CATEGORIES.CONSISTENT,
        score: Number(composite.toFixed(4)),
      };
    }

    if (composite >= 0.4) {
      return {
        category: BEHAVIOR_CATEGORIES.CONSERVATIVE,
        score: Number(composite.toFixed(4)),
      };
    }

    return {
      category: BEHAVIOR_CATEGORIES.ERRATIC,
      score: Number(composite.toFixed(4)),
    };
  }
}

export default BehaviorClassifierService;