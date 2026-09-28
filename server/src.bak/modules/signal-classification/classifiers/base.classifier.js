/**
 * Base Classifier
 *
 * @module signalforge/server/modules/signal-classification/classifiers/base
 */

export class BaseClassifier {
  constructor(name, version = '1.0.0') {
    this.name = name;
    this.version = version;
  }

  async classify(message, options = {}) {
    throw new Error(`${this.name} must implement classify()`);
  }

  buildResult(classification, confidence, signals = null, metadata = null) {
    return {
      classification,
      confidence: Number(confidence.toFixed(4)),
      classifierKind: this.name,
      classifierVersion: this.version,
      signals: signals || null,
      metadata: metadata || null,
      durationMs: null,
    };
  }
}

export default BaseClassifier;