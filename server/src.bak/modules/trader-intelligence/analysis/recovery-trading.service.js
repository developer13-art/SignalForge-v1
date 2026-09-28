/**
 * Recovery Trading Analysis Service
 *
 * @module signalforge/server/modules/trader-intelligence/analysis/recovery-trading
 */

import { RECOVERY_THRESHOLDS } from '../intelligence.constants.js';

export class RecoveryTradingService {
  calculate(trades) {
    if (!Array.isArray(trades) || trades.length < RECOVERY_THRESHOLDS.minTrades) {
      return { score: 0, detected: false, samples: trades?.length || 0 };
    }

    const sorted = [...trades].sort(
      (a, b) =>
        new Date(a.opened_at || 0).getTime() - new Date(b.opened_at || 0).getTime(),
    );

    let recoveryAttempts = 0;
    const totalLosses = sorted.filter((t) => Number(t.realized_profit || 0) < 0).length;

    for (let i = 1; i < sorted.length; i++) {
      const previous = sorted[i - 1];
      const current = sorted[i];

      const previousProfit = Number(previous.realized_profit || 0);
      if (previousProfit >= 0) {
        continue;
      }

      const closed = new Date(previous.closed_at || 0).getTime();
      const opened = new Date(current.opened_at || 0).getTime();
      const minutes = (opened - closed) / (60 * 1000);

      if (
        minutes >= 0 &&
        minutes <= RECOVERY_THRESHOLDS.maxMinutesAfterLoss &&
        Number(current.volume || 0) >= Number(previous.volume || 0)
      ) {
        recoveryAttempts++;
      }
    }

    const ratio =
      totalLosses > 0 ? recoveryAttempts / totalLosses : 0;
    const score = Number(Math.min(1, ratio).toFixed(4));

    return {
      score,
      detected: ratio >= RECOVERY_THRESHOLDS.minRecoveryRatio,
      recoveryAttempts,
      totalLosses,
      ratio: Number(ratio.toFixed(4)),
      samples: sorted.length,
    };
  }
}

export default RecoveryTradingService;