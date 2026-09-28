/**
 * Classification Scorer Service
 *
 * Combines signals from multiple classifiers and returns a final
 * weighted score. Also provides helpers for aggregating confidence
 * over time for reporting.
 *
 * @module signalforge/server/modules/signal-classification/scoring/scorer
 */

import {
  DEFAULT_HIGH_CONFIDENCE,
  DEFAULT_LOW_CONFIDENCE,
} from '../classification.constants.js';

const KIND_WEIGHTS = Object.freeze({
  RULE_BASED: 0.7,
  AI: 0.9,
  HYBRID: 1.0,
  MANUAL: 1.0,
});

export class ClassificationScorerService {
  scoreResult(result) {
    if (!result || typeof result.confidence !== 'number') {
      return 0;
    }
    const weight = KIND_WEIGHTS[result.classifierKind] || 0.5;
    return Math.max(0, Math.min(1, result.confidence * weight));
  }

  classifyConfidenceLevel(confidence) {
    if (confidence >= DEFAULT_HIGH_CONFIDENCE) {
      return 'HIGH';
    }
    if (confidence >= DEFAULT_LOW_CONFIDENCE) {
      return 'MEDIUM';
    }
    return 'LOW';
  }

  aggregate(results) {
    if (!Array.isArray(results) || results.length === 0) {
      return null;
    }

    const totals = new Map();
    for (const result of results) {
      const key = result.classification;
      const score = this.scoreResult(result);
      const entry = totals.get(key) || { classification: key, score: 0, count: 0 };
      entry.score += score;
      entry.count++;
      totals.set(key, entry);
    }

    let best = null;
    for (const entry of totals.values()) {
      entry.averageScore = entry.count > 0 ? entry.score / entry.count : 0;
      if (!best || entry.averageScore > best.averageScore) {
        best = entry;
      }
    }

    return {
      classification: best.classification,
      confidence: best.averageScore,
      participants: best.count,
      all: Array.from(totals.values()),
      level: this.classifyConfidenceLevel(best.averageScore),
    };
  }
}

export default ClassificationScorerService;