/**
 * Symbol Performance Service
 *
 * @module signalforge/server/modules/analytics/metrics/symbol-performance
 */

import { WinRateService } from './win-rate.service.js';

export class SymbolPerformanceService {
  constructor(winRate = null) {
    this.winRate = winRate || new WinRateService();
  }

  calculate(trades) {
    if (!Array.isArray(trades) || trades.length === 0) {
      return { symbols: [], best: null, worst: null };
    }

    const buckets = new Map();

    for (const trade of trades) {
      const symbol = trade.normalized_symbol || trade.symbol;
      if (!symbol) {
        continue;
      }
      if (!buckets.has(symbol)) {
        buckets.set(symbol, []);
      }
      buckets.get(symbol).push(trade);
    }

    const symbols = [];
    for (const [symbol, symbolTrades] of buckets.entries()) {
      const totalProfit = symbolTrades.reduce(
        (sum, t) => sum + Number(t.realized_profit || 0),
        0,
      );
      const winStats = this.winRate.calculate(symbolTrades);
      symbols.push({
        symbol,
        tradeCount: symbolTrades.length,
        totalProfit: Number(totalProfit.toFixed(2)),
        averageProfit: Number((totalProfit / symbolTrades.length).toFixed(2)),
        winRate: winStats.winRate,
        wins: winStats.wins,
        losses: winStats.losses,
      });
    }

    symbols.sort((a, b) => b.totalProfit - a.totalProfit);

    return {
      symbols,
      best: symbols.length > 0 ? symbols[0] : null,
      worst: symbols.length > 0 ? symbols[symbols.length - 1] : null,
    };
  }
}

export default SymbolPerformanceService;