/**
 * Better Exit Service
 *
 * @module signalforge/server/modules/trade-shadow/better-exit
 */

import { DEFAULT_BETTER_EXIT_THRESHOLD, DIVERGENCE_TYPES } from './shadow.constants.js';

export class BetterExitService {
  constructor(threshold = DEFAULT_BETTER_EXIT_THRESHOLD) {
    this.threshold = threshold;
  }

  analyze(providerTrade, userTrade) {
    const providerExit = Number(providerTrade?.exit_price) || 0;
    const userExit = Number(userTrade?.exit_price) || 0;
    const direction = userTrade?.direction || providerTrade?.direction;

    if (!providerExit || !userExit || !direction) {
      return { better: false, reason: 'INSUFFICIENT_DATA' };
    }

    const difference = Number((userExit - providerExit).toFixed(5));
    const absoluteDifference = Math.abs(difference);

    if (absoluteDifference < this.threshold) {
      return {
        better: false,
        reason: 'BELOW_THRESHOLD',
        difference,
      };
    }

    let userWasBetter = false;
    if (direction === 'BUY' && difference > 0) {
      userWasBetter = true;
    }
    if (direction === 'SELL' && difference < 0) {
      userWasBetter = true;
    }

    return {
      better: userWasBetter,
      difference,
      absoluteDifference,
      direction,
      divergenceType: userWasBetter
        ? DIVERGENCE_TYPES.DIFFERENT_PRICE
        : DIVERGENCE_TYPES.EARLY_EXIT,
      threshold: this.threshold,
    };
  }

  summarize(shadows) {
    if (!Array.isArray(shadows) || shadows.length === 0) {
      return {
        total: 0,
        userBetter: 0,
        providerBetter: 0,
        equal: 0,
        userBetterRatio: 0,
      };
    }

    let userBetter = 0;
    let providerBetter = 0;
    let equal = 0;

    for (const shadow of shadows) {
      const missed = Number(shadow.missed_profit || 0);
      if (missed > 0.01) {
        providerBetter++;
      } else if (missed < -0.01) {
        userBetter++;
      } else {
        equal++;
      }
    }

    return {
      total: shadows.length,
      userBetter,
      providerBetter,
      equal,
      userBetterRatio: Number((userBetter / shadows.length).toFixed(4)),
    };
  }
}

export default BetterExitService;