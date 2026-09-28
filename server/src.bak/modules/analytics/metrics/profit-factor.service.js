/**
 * Profit Factor Service
 *
 * @module signalforge/server/modules/analytics/metrics/profit-factor
 */

export class ProfitFactorService {
  calculate(trades) {
    if (!Array.isArray(trades) || trades.length === 0) {
      return { profitFactor: 0, grossProfit: 0, grossLoss: 0 };
    }

    let grossProfit = 0;
    let grossLoss = 0;

    for (const trade of trades) {
      const profit = Number(trade.realized_profit || 0);
      const commission = Number(trade.commission || 0);
      const swap = Number(trade.swap || 0);
      const net = profit - commission - swap;

      if (net > 0) {
        grossProfit += net;
      } else if (net < 0) {
        grossLoss += Math.abs(net);
      }
    }

    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

    return {
      profitFactor: Number.isFinite(profitFactor) ? Number(profitFactor.toFixed(4)) : null,
      grossProfit: Number(grossProfit.toFixed(2)),
      grossLoss: Number(grossLoss.toFixed(2)),
    };
  }
}

export default ProfitFactorService;