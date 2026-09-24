/**
 * Certification Consistency Score Service
 *
 * @module signalforge/server/modules/providers/certification/consistency
 */

export class ConsistencyScoreService {
  calculate(metrics) {
    if (!metrics || typeof metrics !== 'object') {
      return 0;
    }

    const { tradeCount = 0, winCount = 0, averageRr = 0, variance = 0 } = metrics;

    const sampleFactor = Math.min(1, Number(tradeCount) / 100);
    const winRatio = Number(tradeCount) > 0 ? Number(winCount) / Number(tradeCount) : 0;
    const rrFactor = Math.min(1, Number(averageRr) / 3);
    const variancePenalty = Math.min(1, Number(variance));

    const score =
      sampleFactor * 0.3 +
      winRatio * 0.35 +
      rrFactor * 0.2 +
      (1 - variancePenalty) * 0.15;

    return Number(Math.max(0, Math.min(1, score)).toFixed(4));
  }

  classify(score) {
    if (score >= 0.85) {
      return 'EXCELLENT';
    }
    if (score >= 0.7) {
      return 'GOOD';
    }
    if (score >= 0.5) {
      return 'MODERATE';
    }
    return 'LOW';
  }
}

export default ConsistencyScoreService;