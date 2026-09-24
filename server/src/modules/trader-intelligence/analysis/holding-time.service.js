/**
 * Holding Time Analysis Service
 *
 * @module signalforge/server/modules/trader-intelligence/analysis/holding-time
 */

export class HoldingTimeService {
  calculate(trades) {
    if (!Array.isArray(trades) || trades.length === 0) {
      return { averageMinutes: 0, medianMinutes: 0, samples: 0 };
    }

    const durations = [];
    for (const trade of trades) {
      if (!trade.opened_at || !trade.closed_at) {
        continue;
      }
      const opened = new Date(trade.opened_at).getTime();
      const closed = new Date(trade.closed_at).getTime();
      if (Number.isNaN(opened) || Number.isNaN(closed)) {
        continue;
      }
      const minutes = (closed - opened) / (60 * 1000);
      if (minutes >= 0) {
        durations.push(minutes);
      }
    }

    if (durations.length === 0) {
      return { averageMinutes: 0, medianMinutes: 0, samples: 0 };
    }

    const sorted = [...durations].sort((a, b) => a - b);
    const mean = durations.reduce((a, b) => a + b, 0) / durations.length;
    const median = sorted[Math.floor(sorted.length / 2)];

    return {
      averageMinutes: Number(mean.toFixed(2)),
      medianMinutes: Number(median.toFixed(2)),
      minMinutes: Number(sorted[0].toFixed(2)),
      maxMinutes: Number(sorted[sorted.length - 1].toFixed(2)),
      samples: durations.length,
    };
  }

  classify(averageMinutes) {
    if (averageMinutes <= 0) {
      return 'UNCLASSIFIED';
    }
    if (averageMinutes < 15) {
      return 'SCALPING';
    }
    if (averageMinutes < 24 * 60) {
      return 'INTRADAY';
    }
    if (averageMinutes < 7 * 24 * 60) {
      return 'SWING';
    }
    return 'POSITION';
  }
}

export default HoldingTimeService;