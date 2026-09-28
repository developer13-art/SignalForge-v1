/**
 * Drawdown Service
 *
 * @module signalforge/server/modules/analytics/metrics/drawdown
 */

export class DrawdownService {
  calculate(trades) {
    if (!Array.isArray(trades) || trades.length === 0) {
      return {
        maxDrawdown: 0,
        maxDrawdownPercent: 0,
        currentDrawdown: 0,
        peakEquity: 0,
        curve: [],
      };
    }

    const sorted = [...trades].sort(
      (a, b) => new Date(a.closed_at || 0).getTime() - new Date(b.closed_at || 0).getTime(),
    );

    let runningEquity = 0;
    let peak = 0;
    let maxDrawdown = 0;
    let maxDrawdownPercent = 0;
    const curve = [];

    for (const trade of sorted) {
      const profit = Number(trade.realized_profit || 0);
      const commission = Number(trade.commission || 0);
      const swap = Number(trade.swap || 0);
      runningEquity += profit - commission - swap;

      if (runningEquity > peak) {
        peak = runningEquity;
      }

      const drawdown = peak - runningEquity;
      const drawdownPercent = peak > 0 ? (drawdown / peak) * 100 : 0;

      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
      if (drawdownPercent > maxDrawdownPercent) {
        maxDrawdownPercent = drawdownPercent;
      }

      curve.push({
        time: trade.closed_at,
        equity: Number(runningEquity.toFixed(2)),
        drawdown: Number(drawdown.toFixed(2)),
        drawdownPercent: Number(drawdownPercent.toFixed(2)),
      });
    }

    const currentDrawdown = peak - runningEquity;

    return {
      maxDrawdown: Number(maxDrawdown.toFixed(2)),
      maxDrawdownPercent: Number(maxDrawdownPercent.toFixed(2)),
      currentDrawdown: Number(currentDrawdown.toFixed(2)),
      peakEquity: Number(peak.toFixed(2)),
      curve,
    };
  }
}

export default DrawdownService;