/**
 * Win Rate Service
 *
 * @module signalforge/server/modules/analytics/metrics/win-rate
 */

export class WinRateService {
  calculate(trades) {
    if (!Array.isArray(trades) || trades.length === 0) {
      return { winRate: 0, wins: 0, losses: 0, total: 0 };
    }

    let wins = 0;
    let losses = 0;
    let breakeven = 0;

    for (const trade of trades) {
      const profit = Number(trade.realized_profit || 0);
      if (profit > 0.001) {
        wins++;
      } else if (profit < -0.001) {
        losses++;
      } else {
        breakeven++;
      }
    }

    const decided = wins + losses;
    const winRate = decided > 0 ? (wins / decided) * 100 : 0;

    return {
      winRate: Number(winRate.toFixed(2)),
      wins,
      losses,
      breakeven,
      total: trades.length,
    };
  }
}

export default WinRateService;