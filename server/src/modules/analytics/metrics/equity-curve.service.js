/**
 * Equity Curve Service
 *
 * @module signalforge/server/modules/analytics/metrics/equity-curve
 */

import { DEFAULT_EQUITY_CURVE_POINTS } from '../analytics.constants.js';

export class EquityCurveService {
  constructor(repository = null) {
    this.repository = repository;
  }

  calculate(trades, options = {}) {
    if (!Array.isArray(trades) || trades.length === 0) {
      return { points: [], startEquity: 0, endEquity: 0, totalReturn: 0 };
    }

    const sorted = [...trades].sort(
      (a, b) => new Date(a.closed_at || 0).getTime() - new Date(b.closed_at || 0).getTime(),
    );

    const startEquity = Number(options.startingEquity || 0);
    let runningEquity = startEquity;
    const points = [];

    for (const trade of sorted) {
      const profit = Number(trade.realized_profit || 0);
      const commission = Number(trade.commission || 0);
      const swap = Number(trade.swap || 0);
      runningEquity += profit - commission - swap;

      points.push({
        timestamp: trade.closed_at,
        equity: Number(runningEquity.toFixed(2)),
        tradeId: trade.id,
        profit: Number((profit - commission - swap).toFixed(2)),
      });
    }

    const maxPoints = options.maxPoints || DEFAULT_EQUITY_CURVE_POINTS;
    const sampled = points.length > maxPoints ? this.samplePoints(points, maxPoints) : points;

    return {
      points: sampled,
      startEquity,
      endEquity: Number(runningEquity.toFixed(2)),
      totalReturn: Number((runningEquity - startEquity).toFixed(2)),
      totalReturnPercent:
        startEquity > 0
          ? Number((((runningEquity - startEquity) / startEquity) * 100).toFixed(2))
          : null,
      tradeCount: trades.length,
    };
  }

  samplePoints(points, maxPoints) {
    const step = Math.ceil(points.length / maxPoints);
    const sampled = [];
    for (let i = 0; i < points.length; i += step) {
      sampled.push(points[i]);
    }
    if (sampled[sampled.length - 1] !== points[points.length - 1]) {
      sampled.push(points[points.length - 1]);
    }
    return sampled;
  }
}

export default EquityCurveService;