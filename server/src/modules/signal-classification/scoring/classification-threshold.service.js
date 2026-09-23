/**
 * Classification Threshold Service
 *
 * Determines whether a classification result meets the platform's
 * threshold for downstream processing.
 *
 * @module signalforge/server/modules/signal-classification/scoring/threshold
 */

import {
  EXECUTABLE_CLASSIFICATIONS,
  DEFAULT_MIN_CONFIDENCE,
} from '../classification.constants.js';

export class ClassificationThresholdService {
  constructor(minConfidence = DEFAULT_MIN_CONFIDENCE) {
    this.minConfidence = minConfidence;
  }

  isAboveThreshold(result, options = {}) {
    if (!result) {
      return false;
    }
    const threshold = options.minConfidence ?? this.minConfidence;
    return typeof result.confidence === 'number' && result.confidence >= threshold;
  }

  isExecutable(result, options = {}) {
    if (!result) {
      return false;
    }
    if (!EXECUTABLE_CLASSIFICATIONS.includes(result.classification)) {
      return false;
    }
    return this.isAboveThreshold(result, options);
  }

  requiresManualReview(result, options = {}) {
    if (!result) {
      return true;
    }
    const threshold = options.minConfidence ?? this.minConfidence;
    const uncertainThreshold = options.uncertainThreshold ?? threshold - 0.2;
    return (
      typeof result.confidence === 'number' &&
      result.confidence >= uncertainThreshold &&
      result.confidence < threshold
    );
  }
}

export default ClassificationThresholdService;