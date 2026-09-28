/**
 * Certification Risk Assessment Service
 *
 * @module signalforge/server/modules/providers/certification/risk
 */

const WEIGHTS = Object.freeze({
  maxDrawdown: 0.3,
  averageRisk: 0.2,
  losingStreak: 0.2,
  martingale: 0.15,
  newsExposure: 0.15,
});

export class RiskAssessmentService {
  calculate({
    maxDrawdownPercent = 0,
    averageRiskPercent = 0,
    longestLosingStreak = 0,
    martingaleDetected = false,
    newsTradeCount = 0,
    tradeCount = 0,
  }) {
    const drawdownFactor = Math.min(1, Number(maxDrawdownPercent) / 50);
    const riskFactor = Math.min(1, Number(averageRiskPercent) / 5);
    const losingStreakFactor = Math.min(1, Number(longestLosingStreak) / 10);
    const martingaleFactor = martingaleDetected ? 1 : 0;
    const newsExposure =
      Number(tradeCount) > 0 ? Math.min(1, Number(newsTradeCount) / Number(tradeCount)) : 0;

    const score =
      drawdownFactor * WEIGHTS.maxDrawdown +
      riskFactor * WEIGHTS.averageRisk +
      losingStreakFactor * WEIGHTS.losingStreak +
      martingaleFactor * WEIGHTS.martingale +
      newsExposure * WEIGHTS.newsExposure;

    return Number(Math.max(0, Math.min(1, score)).toFixed(4));
  }

  classify(score) {
    if (score <= 0.25) {
      return 'LOW';
    }
    if (score <= 0.5) {
      return 'MODERATE';
    }
    if (score <= 0.75) {
      return 'HIGH';
    }
    return 'CRITICAL';
  }
}

export default RiskAssessmentService;