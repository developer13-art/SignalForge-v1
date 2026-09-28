/**
 * Consistency Analysis Service
 *
 * @module signalforge/server/modules/trader-intelligence/analysis/consistency
 */

export class ConsistencyService {
  calculate(trades) {
    if (!Array.isArray(trades) || trades.length === 0) {
      return { score: 0, samples: 0 };
    }

    const dailyProfits = this.aggregateDaily(trades);
    if (dailyProfits.length < 2) {
      return { score: 0, samples: dailyProfits.length };
    }

    const positive = dailyProfits.filter((p) => p > 0).length;
    const total = dailyProfits.length;
    const positiveRatio = positive / total;

    const mean = dailyProfits.reduce((a, b) => a + b, 0) / total;
    const variance =
      dailyProfits.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / total;
    const stdDev = Math.sqrt(variance);
    const coefficientVariation = mean !== 0 ? stdDev / Math.abs(mean) : 0;
    const stabilityFactor = Math.max(0, 1 - Math.min(1, coefficientVariation / 2));

    const sampleFactor = Math.min(1, total / 30);

    const score =
      positiveRatio * 0.4 + stabilityFactor * 0.4 + sampleFactor * 0.2;

    return {
      score: Number(Math.max(0, Math.min(1, score)).toFixed(4)),
      samples: total,
      positiveRatio: Number(positiveRatio.toFixed(4)),
      stabilityFactor: Number(stabilityFactor.toFixed(4)),
    };
  }

  aggregateDaily(trades) {
    const buckets = new Map();
    for (const trade of trades) {
      const day = trade.closed_at
        ? new Date(trade.closed_at).toISOString().split('T')[0]
        : null;
      if (!day) {
        continue;
      }
      const profit = Number(trade.realized_profit || 0);
      buckets.set(day, (buckets.get(day) || 0) + profit);
    }
    return Array.from(buckets.values());
  }

  classify(score) {
    if (score >= 0.85) {
      return 'VERY_CONSISTENT';
    }
    if (score >= 0.7) {
      return 'CONSISTENT';
    }
    if (score >= 0.5) {
      return 'MODERATE';
    }
    return 'INCONSISTENT';
  }
}

export default ConsistencyService;