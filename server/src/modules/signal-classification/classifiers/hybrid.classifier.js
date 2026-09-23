/**
 * Hybrid Classifier
 *
 * Runs the rule-based classifier first. If confidence is below the
 * configured AI threshold, falls back to the AI classifier. Merges
 * results so the final classification reflects both signals.
 *
 * @module signalforge/server/modules/signal-classification/classifiers/hybrid
 */

import { BaseClassifier } from './base.classifier.js';
import { RuleBasedClassifier } from './rule-based.classifier.js';
import { AiClassifier } from './ai.classifier.js';
import {
  CLASSIFIER_KINDS,
  DEFAULT_RULE_BASED_THRESHOLD,
  DEFAULT_AI_THRESHOLD,
} from '../classification.constants.js';

export class HybridClassifier extends BaseClassifier {
  constructor(llmGateway = null, options = {}) {
    super(CLASSIFIER_KINDS.HYBRID, '1.0.0');
    this.ruleBased = options.ruleBased || new RuleBasedClassifier();
    this.ai = options.ai || new AiClassifier(llmGateway);
    this.ruleBasedThreshold =
      options.ruleBasedThreshold ?? DEFAULT_RULE_BASED_THRESHOLD;
    this.aiThreshold = options.aiThreshold ?? DEFAULT_AI_THRESHOLD;
  }

  async classify(message) {
    const start = Date.now();

    const ruleResult = await this.ruleBased.classify(message);

    if (ruleResult.confidence >= this.ruleBasedThreshold) {
      ruleResult.classifierKind = CLASSIFIER_KINDS.HYBRID;
      ruleResult.classifierVersion = this.version;
      ruleResult.metadata = {
        ...(ruleResult.metadata || {}),
        decision: 'rule_based',
        ruleConfidence: ruleResult.confidence,
      };
      ruleResult.durationMs = Date.now() - start;
      return ruleResult;
    }

    const aiResult = await this.ai.classify(message);

    const finalResult = {
      classification:
        aiResult.confidence > ruleResult.confidence
          ? aiResult.classification
          : ruleResult.classification,
      confidence: Math.max(ruleResult.confidence, aiResult.confidence),
      classifierKind: CLASSIFIER_KINDS.HYBRID,
      classifierVersion: this.version,
      signals: {
        ruleBased: ruleResult.signals,
        ai: aiResult.signals,
      },
      metadata: {
        decision: 'hybrid',
        ruleConfidence: ruleResult.confidence,
        aiConfidence: aiResult.confidence,
        ruleClassification: ruleResult.classification,
        aiClassification: aiResult.classification,
      },
      durationMs: Date.now() - start,
    };

    return finalResult;
  }
}

export default HybridClassifier;