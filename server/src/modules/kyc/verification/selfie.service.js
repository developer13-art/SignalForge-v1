/**
 * Selfie Service
 *
 * @module signalforge/server/modules/kyc/verification/selfie
 */

import { VERIFICATION_RESULTS } from '../kyc.constants.js';

export class SelfieService {
  constructor(provider = null) {
    this.provider = provider;
  }

  async compare(selfieBuffer, referenceImageBuffer) {
    if (!this.provider || typeof this.provider.compareSelfie !== 'function') {
      return {
        result: VERIFICATION_RESULTS.INCONCLUSIVE,
        similarity: null,
        reason: 'Selfie comparison not supported by provider',
      };
    }

    const response = await this.provider.compareSelfie(selfieBuffer, referenceImageBuffer);

    if (!response || typeof response.similarity !== 'number') {
      return {
        result: VERIFICATION_RESULTS.INCONCLUSIVE,
        similarity: null,
        reason: 'Selfie comparison response missing similarity',
      };
    }

    if (response.similarity >= 0.8) {
      return { result: VERIFICATION_RESULTS.PASSED, similarity: response.similarity };
    }

    return {
      result: VERIFICATION_RESULTS.FAILED,
      similarity: response.similarity,
      reason: 'Selfie similarity below threshold',
    };
  }
}

export default SelfieService;