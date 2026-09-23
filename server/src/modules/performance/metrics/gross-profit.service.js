/**
 * Gross Profit Service
 *
 * @module signalforge/server/modules/performance/metrics/gross-profit
 */

export class GrossProfitService {
  calculate(trades) {
    if (!Array.isArray(trades) || trades.length === 0) {
      return { total: 0, count: 0, trades: [] };
    }

    let total = 0;
    let count = 0;
    const breakdown = [];

    for (const trade of trades) {
      const profit = Number(trade.realized_profit || 0);
      if (profit > 0) {
        total += profit;
        count++;
        breakdown.push({
          tradeId: trade.id,
          symbol: trade.symbol,
          profit: Number(profit.toFixed(2)),
        });
      }
    }

    return {
      total: Number(total.toFixed(2)),
      count,
      trades: breakdown,
    };
  }
}

export default GrossProfitService;