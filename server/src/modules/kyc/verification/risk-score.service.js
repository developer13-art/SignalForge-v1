/**
 * Risk Score Service
 *
 * Computes a normalized risk score for a KYC application based on
 * multiple signals including provider results, name match, DOB match,
 * liveness, and platform-level heuristics.
 *
 * @module signalforge/server/modules/kyc/verification/risk-score
 */

const RISK_WEIGHTS = Object.freeze({
  nameMatch: 0.2,
  dobMatch: 0.15,
  liveness: 0.25,
  documentCheck: 0.2,
  identityCheck: 0.2,
});

export class RiskScoreService {
  compute(signals = {}) {
    const components = {};
    let totalWeight = 0;
    let weightedScore = 0;

    for (const [key, weight] of Object.entries(RISK_WEIGHTS)) {
      const value = signals[key];
      if (value === undefined || value === null) {
        continue;
      }
      const normalized = value === true ? 0 : value === false ? 1 : Number(value);
      if (!Number.isFinite(normalized)) {
        continue;
      }
      components[key] = normalized;
      weightedScore += normalized * weight;
      totalWeight += weight;
    }

    if (totalWeight === 0) {
      return {
        score: null,
        components,
        reason: 'Insufficient signals to compute risk score',
      };
    }

    const score = Math.max(0, Math.min(1, weightedScore / totalWeight));

    return { score, components };
  }
}

export default RiskScoreService;