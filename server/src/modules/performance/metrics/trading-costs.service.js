/**
 * Trading Costs Service
 *
 * @module signalforge/server/modules/performance/metrics/trading-costs
 */

export class TradingCostsService {
  calculate(trades) {
    if (!Array.isArray(trades) || trades.length === 0) {
      return { total: 0, commission: 0, swap: 0, count: 0 };
    }

    let commission = 0;
    let swap = 0;
    const breakdown = [];

    for (const trade of trades) {
      const tradeCommission = Number(trade.commission || 0);
      const tradeSwap = Number(trade.swap || 0);

      commission += Math.abs(tradeCommission);
      swap += Math.abs(tradeSwap);

      if (tradeCommission !== 0 || tradeSwap !== 0) {
        breakdown.push({
          tradeId: trade.id,
          symbol: trade.symbol,
          commission: Number(tradeCommission.toFixed(2)),
          swap: Number(tradeSwap.toFixed(2)),
        });
      }
    }

    const total = commission + swap;

    return {
      total: Number(total.toFixed(2)),
      commission: Number(commission.toFixed(2)),
      swap: Number(swap.toFixed(2)),
      count: breakdown.length,
      trades: breakdown,
    };
  }
}

export default TradingCostsService;