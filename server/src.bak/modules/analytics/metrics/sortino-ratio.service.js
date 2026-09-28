/**
 * Sortino Ratio Service
 *
 * @module signalforge/server/modules/analytics/metrics/sortino-ratio
 */

import {
  RISK_FREE_RATE_ANNUAL,
  TRADING_DAYS_PER_YEAR,
} from '../analytics.constants.js';

export class SortinoRatioService {
  calculate(trades, options = {}) {
    if (!Array.isArray(trades) || trades.length < 2) {
      return { sortinoRatio: null, samples: trades?.length || 0 };
    }

    const riskFreeAnnual = options.riskFreeRate ?? RISK_FREE_RATE_ANNUAL;
    const dailyRiskFree = riskFreeAnnual / TRADING_DAYS_PER_YEAR;

    const dailyReturns = this.aggregateByDay(trades);

    if (dailyReturns.length < 2) {
      return { sortinoRatio: null, samples: dailyReturns.length };
    }

    const meanReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;

    const negativeReturns = dailyReturns.filter((r) => r < dailyRiskFree);

    if (negativeReturns.length === 0) {
      return { sortinoRatio: null, samples: dailyReturns.length, reason: 'NO_DOWNSIDE' };
    }

    const downsideVariance =
      negativeReturns.reduce((sum, r) => sum + Math.pow(r - dailyRiskFree, 2), 0) /
      dailyReturns.length;
    const downsideDeviation = Math.sqrt(downsideVariance);

    if (downsideDeviation === 0) {
      return { sortinoRatio: null, samples: dailyReturns.length };
    }

    const sortino = ((meanReturn - dailyRiskFree) / downsideDeviation) * Math.sqrt(TRADING_DAYS_PER_YEAR);

    return {
      sortinoRatio: Number(sortino.toFixed(4)),
      samples: dailyReturns.length,
      meanDailyReturn: Number(meanReturn.toFixed(6)),
      downsideDeviation: Number(downsideDeviation.toFixed(6)),
    };
  }

  aggregateByDay(trades) {
    const buckets = new Map();
    for (const trade of trades) {
      const date = trade.closed_at ? new Date(trade.closed_at).toISOString().split('T')[0] : null;
      if (!date) {
        continue;
      }
      const profit = Number(trade.realized_profit || 0);
      buckets.set(date, (buckets.get(date) || 0) + profit);
    }
    return Array.from(buckets.values());
  }
}

export default SortinoRatioService;