/**
 * Threshold Service
 *
 * @module signalforge/server/modules/ai-signal-intelligence/confidence/threshold
 */

import {
  CONFIDENCE_THRESHOLDS,
  CONFIDENCE_LEVELS,
  DEFAULT_MIN_CONFIDENCE,
} from '../ai.constants.js';

export class ThresholdService {
  constructor(minConfidence = DEFAULT_MIN_CONFIDENCE) {
    this.minConfidence = minConfidence;
  }

  classify(confidence) {
    if (confidence >= CONFIDENCE_THRESHOLDS.VERY_HIGH) {
      return CONFIDENCE_LEVELS.VERY_HIGH;
    }
    if (confidence >= CONFIDENCE_THRESHOLDS.HIGH) {
      return CONFIDENCE_LEVELS.HIGH;
    }
    if (confidence >= CONFIDENCE_THRESHOLDS.MEDIUM) {
      return CONFIDENCE_LEVELS.MEDIUM;
    }
    if (confidence >= CONFIDENCE_THRESHOLDS.LOW) {
      return CONFIDENCE_LEVELS.LOW;
    }
    return CONFIDENCE_LEVELS.VERY_LOW;
  }

  isAboveThreshold(confidence, override = null) {
    const threshold = override ?? this.minConfidence;
    return typeof confidence === 'number' && confidence >= threshold;
  }

  requiresReview(confidence, override = null) {
    const threshold = override ?? this.minConfidence;
    return typeof confidence === 'number' && confidence < threshold;
  }
}

export default ThresholdService;