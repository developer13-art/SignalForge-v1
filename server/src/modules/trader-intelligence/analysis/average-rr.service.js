/**
 * Average Risk-Reward Analysis Service
 *
 * @module signalforge/server/modules/trader-intelligence/analysis/average-rr
 */

export class AverageRrService {
  calculate(trades) {
    if (!Array.isArray(trades) || trades.length === 0) {
      return { averageRr: 0, samples: 0 };
    }

    let totalRr = 0;
    let samples = 0;

    for (const trade of trades) {
      const entry = Number(trade.entry_price || 0);
      const stopLoss = Number(trade.stop_loss || 0);
      const exit = Number(trade.exit_price || 0);

      if (!entry || !stopLoss || !exit) {
        continue;
      }

      const risk = Math.abs(entry - stopLoss);
      const reward = Math.abs(exit - entry);

      if (risk <= 0) {
        continue;
      }

      totalRr += reward / risk;
      samples++;
    }

    const averageRr = samples > 0 ? totalRr / samples : 0;

    return {
      averageRr: Number(averageRr.toFixed(4)),
      samples,
    };
  }

  classify(averageRr) {
    if (averageRr <= 0) {
      return 'UNCLASSIFIED';
    }
    if (averageRr < 1) {
      return 'POOR';
    }
    if (averageRr < 1.5) {
      return 'FAIR';
    }
    if (averageRr < 2.5) {
      return 'GOOD';
    }
    return 'EXCELLENT';
  }
}

export default AverageRrService;