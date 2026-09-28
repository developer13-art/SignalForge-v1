/**
 * Sharpe Ratio Service
 *
 * @module signalforge/server/modules/analytics/metrics/sharpe-ratio
 */

import {
  RISK_FREE_RATE_ANNUAL,
  TRADING_DAYS_PER_YEAR,
} from '../analytics.constants.js';

export class SharpeRatioService {
  calculate(trades, options = {}) {
    if (!Array.isArray(trades) || trades.length < 2) {
      return { sharpeRatio: null, samples: trades?.length || 0 };
    }

    const riskFreeAnnual = options.riskFreeRate ?? RISK_FREE_RATE_ANNUAL;
    const dailyRiskFree = riskFreeAnnual / TRADING_DAYS_PER_YEAR;

    const dailyReturns = this.aggregateByDay(trades);

    if (dailyReturns.length < 2) {
      return { sharpeRatio: null, samples: dailyReturns.length };
    }

    const meanReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
    const variance =
      dailyReturns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) /
      dailyReturns.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) {
      return { sharpeRatio: null, samples: dailyReturns.length };
    }

    const sharpe = ((meanReturn - dailyRiskFree) / stdDev) * Math.sqrt(TRADING_DAYS_PER_YEAR);

    return {
      sharpeRatio: Number(sharpe.toFixed(4)),
      samples: dailyReturns.length,
      meanDailyReturn: Number(meanReturn.toFixed(6)),
      stdDevDaily: Number(stdDev.toFixed(6)),
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

export default SharpeRatioService;