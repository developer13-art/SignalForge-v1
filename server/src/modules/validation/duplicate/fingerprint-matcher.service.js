/**
 * Fingerprint Matcher Service
 *
 * @module signalforge/server/modules/validation/duplicate/fingerprint-matcher
 */

import { FingerprintService } from '../../signal-standardization/fingerprint.service.js';

const SIMILARITY_THRESHOLD = 0.98;

export class FingerprintMatcherService {
  constructor(fingerprintService = null) {
    this.fingerprints = fingerprintService || new FingerprintService();
  }

  compare(signalA, signalB) {
    const fpA = signalA?.fingerprint || this.fingerprints.compute(signalA).fingerprint;
    const fpB = signalB?.fingerprint || this.fingerprints.compute(signalB).fingerprint;
    if (!fpA || !fpB) {
      return { similar: false, similarity: 0 };
    }
    const similarity = fpA === fpB ? 1 : this.characterSimilarity(fpA, fpB);
    return {
      similar: similarity >= SIMILARITY_THRESHOLD,
      similarity,
    };
  }

  characterSimilarity(a, b) {
    const len = Math.min(a.length, b.length);
    let matching = 0;
    for (let i = 0; i < len; i++) {
      if (a[i] === b[i]) {
        matching++;
      }
    }
    return matching / Math.max(a.length, b.length);
  }
}

export default FingerprintMatcherService;