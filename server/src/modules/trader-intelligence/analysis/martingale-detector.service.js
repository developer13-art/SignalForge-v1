/**
 * Martingale Detector Service
 *
 * @module signalforge/server/modules/trader-intelligence/analysis/martingale-detector
 */

import { MARTINGALE_THRESHOLDS } from '../intelligence.constants.js';

export class MartingaleDetectorService {
  calculate(trades) {
    if (!Array.isArray(trades) || trades.length < MARTINGALE_THRESHOLDS.minTrades) {
      return { score: 0, detected: false, samples: trades?.length || 0 };
    }

    const sorted = [...trades].sort(
      (a, b) =>
        new Date(a.closed_at || 0).getTime() - new Date(b.closed_at || 0).getTime(),
    );

    let losingStreak = 0;
    let maximumStreak = 0;
    let escalationCount = 0;
    let opportunities = 0;

    for (let i = 1; i < sorted.length; i++) {
      const previous = sorted[i - 1];
      const current = sorted[i];

      const previousProfit = Number(previous.realized_profit || 0);
      if (previousProfit < 0) {
        losingStreak++;
        maximumStreak = Math.max(maximumStreak, losingStreak);
      } else {
        losingStreak = 0;
      }

      if (losingStreak >= MARTINGALE_THRESHOLDS.minLosingStreak) {
        opportunities++;
        const prevVolume = Number(previous.volume || 0);
        const currVolume = Number(current.volume || 0);
        if (
          prevVolume > 0 &&
          currVolume >= prevVolume * MARTINGALE_THRESHOLDS.volumeMultiplier
        ) {
          escalationCount++;
        }
      }
    }

    if (opportunities === 0) {
      return {
        score: 0,
        detected: false,
        maximumStreak,
        opportunities: 0,
        samples: sorted.length,
      };
    }

    const escalationRatio = escalationCount / opportunities;
    const score = Number(Math.min(1, escalationRatio).toFixed(4));

    return {
      score,
      detected: escalationRatio >= 0.5,
      maximumStreak,
      opportunities,
      escalationCount,
      samples: sorted.length,
    };
  }
}

export default MartingaleDetectorService;