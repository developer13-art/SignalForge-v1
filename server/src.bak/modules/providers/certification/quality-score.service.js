/**
 * Certification Quality Score Service
 *
 * @module signalforge/server/modules/providers/certification/quality
 */

const WEIGHTS = Object.freeze({
  parsingAccuracy: 0.3,
  managementAccuracy: 0.2,
  validationRate: 0.2,
  consistencyScore: 0.2,
  sampleSize: 0.1,
});

export class QualityScoreService {
  calculate({
    parsingAccuracy = 0,
    managementAccuracy = 0,
    validationRate = 0,
    consistencyScore = 0,
    tradeCount = 0,
  }) {
    const sampleSize = Math.min(1, Number(tradeCount) / 200);

    const score =
      Number(parsingAccuracy) * WEIGHTS.parsingAccuracy +
      Number(managementAccuracy) * WEIGHTS.managementAccuracy +
      Number(validationRate) * WEIGHTS.validationRate +
      Number(consistencyScore) * WEIGHTS.consistencyScore +
      sampleSize * WEIGHTS.sampleSize;

    return Number(Math.max(0, Math.min(1, score)).toFixed(4));
  }

  classify(score) {
    if (score >= 0.9) {
      return 'PLATINUM';
    }
    if (score >= 0.8) {
      return 'GOLD';
    }
    if (score >= 0.7) {
      return 'SILVER';
    }
    if (score >= 0.6) {
      return 'BRONZE';
    }
    return 'BELOW_THRESHOLD';
  }

  tierFromScore(score) {
    return this.classify(score);
  }
}

export default QualityScoreService;