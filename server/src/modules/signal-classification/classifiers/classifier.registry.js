/**
 * Classifier Registry
 *
 * @module signalforge/server/modules/signal-classification/classifiers/registry
 */
const { RuleBasedClassifier } = require('./rule-based.classifier.js');
const { AiClassifier } = require('./ai.classifier.js');
const { HybridClassifier } = require('./hybrid.classifier.js');
const { CLASSIFIER_KINDS } = require('../classification.constants.js');
const { ClassifierNotRegisteredError } = require('../classification.errors.js');

const registry = new Map();

registry.set(CLASSIFIER_KINDS.RULE_BASED, () => new RuleBasedClassifier());
registry.set(CLASSIFIER_KINDS.AI, (options) => new AiClassifier(options?.llmGateway));
registry.set(CLASSIFIER_KINDS.HYBRID, (options) => new HybridClassifier(options?.llmGateway, options));
class ClassifierRegistry {
  static register(kind, factory) {
    if (typeof factory !== 'function') {
      throw new Error('Classifier factory must be a function');
    }
    registry.set(kind, factory);
  }

  static create(kind, options = {}) {
    const factory = registry.get(kind);
    if (!factory) {
      throw new ClassifierNotRegisteredError(undefined, { kind });
    }
    return factory(options);
  }

  static list() {
    return Array.from(registry.keys());
  }

  static supports(kind) {
    return registry.has(kind);
  }
}
module.exports = ClassifierRegistry;
module.exports.ClassifierRegistry = ClassifierRegistry;
