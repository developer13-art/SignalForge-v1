/**
 * Liveness Service
 *
 * Wraps the KYC provider's liveness detection endpoint. In the current
 * implementation, liveness is performed entirely by the provider; this
 * service normalizes the response and exposes a consistent API.
 *
 * @module signalforge/server/modules/kyc/verification/liveness
 */

import { DEFAULT_LIVENESS_THRESHOLD, VERIFICATION_RESULTS } from '../kyc.constants.js';

export class LivenessService {
  constructor(provider = null) {
    this.provider = provider;
  }

  async check(applicationId, selfieBuffer, options = {}) {
    const threshold = options.threshold || DEFAULT_LIVENESS_THRESHOLD;

    if (!this.provider || typeof this.provider.checkLiveness !== 'function') {
      return {
        result: VERIFICATION_RESULTS.INCONCLUSIVE,
        score: null,
        reason: 'Liveness provider not configured',
      };
    }

    const response = await this.provider.checkLiveness(applicationId, selfieBuffer, options);

    if (!response || typeof response.score !== 'number') {
      return {
        result: VERIFICATION_RESULTS.INCONCLUSIVE,
        score: null,
        reason: 'Liveness response missing score',
      };
    }

    if (response.score >= threshold) {
      return {
        result: VERIFICATION_RESULTS.PASSED,
        score: response.score,
      };
    }

    return {
      result: VERIFICATION_RESULTS.FAILED,
      score: response.score,
      reason: 'Liveness score below threshold',
    };
  }
}

export default LivenessService;