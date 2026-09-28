/**
 * Missed Profit Service
 *
 * @module signalforge/server/modules/trade-shadow/missed-profit
 */

import { DEFAULT_MISSED_PROFIT_THRESHOLD } from './shadow.constants.js';

export class MissedProfitService {
  constructor(threshold = DEFAULT_MISSED_PROFIT_THRESHOLD) {
    this.threshold = threshold;
  }

  calculate(providerProfit, userProfit) {
    const provider = Number(providerProfit) || 0;
    const user = Number(userProfit) || 0;
    const missed = Number((provider - user).toFixed(2));

    return {
      missedProfit: missed,
      direction: missed > 0 ? 'MISSED' : missed < 0 ? 'GAINED' : 'EQUAL',
      exceedsThreshold: Math.abs(missed) >= this.threshold,
      threshold: this.threshold,
    };
  }

  summarize(shadows) {
    if (!Array.isArray(shadows) || shadows.length === 0) {
      return {
        count: 0,
        totalMissed: 0,
        totalGained: 0,
        net: 0,
        averageMissed: 0,
      };
    }

    let totalMissed = 0;
    let totalGained = 0;

    for (const shadow of shadows) {
      const missed = Number(shadow.missed_profit || 0);
      if (missed > 0) {
        totalMissed += missed;
      } else {
        totalGained += Math.abs(missed);
      }
    }

    const net = Number((totalGained - totalMissed).toFixed(2));

    return {
      count: shadows.length,
      totalMissed: Number(totalMissed.toFixed(2)),
      totalGained: Number(totalGained.toFixed(2)),
      net,
      averageMissed: Number((totalMissed / shadows.length).toFixed(2)),
    };
  }
}

export default MissedProfitService;