/**
 * Confidence Service
 *
 * @module signalforge/server/modules/ai-signal-intelligence/confidence/service
 */

import { ConfidenceRepository } from './confidence.repository.js';
import { ScoringModelService } from './scoring-model.service.js';
import { ThresholdService } from './threshold.service.js';
import { emitConfidenceScored } from '../ai.events.js';
import {
  DEFAULT_MIN_CONFIDENCE,
  DEFAULT_LOW_CONFIDENCE_ACTION,
} from '../ai.constants.js';

export class ConfidenceService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new ConfidenceRepository();
    this.scoringModel = dependencies.scoringModel || new ScoringModelService();
    this.threshold = dependencies.threshold || new ThresholdService(DEFAULT_MIN_CONFIDENCE);
    this.lowConfidenceAction =
      dependencies.lowConfidenceAction || DEFAULT_LOW_CONFIDENCE_ACTION;
  }

  async scoreAndPersist(signalId, messageId, fields, parserConfidence, meta = {}) {
    const { confidence, factors } = this.scoringModel.score(fields, parserConfidence);
    const level = this.threshold.classify(confidence);
    const requiresReview = this.threshold.requiresReview(confidence);

    const stored = await this.repository.create({
      signalId,
      messageId,
      confidence,
      level,
      model: meta.model || null,
      factors,
      metadata: { requiresReview },
    });

    await emitConfidenceScored(signalId, confidence, level, meta);

    return {
      id: stored.id,
      confidence,
      level,
      factors,
      requiresReview,
      action: requiresReview ? this.lowConfidenceAction : 'CONTINUE',
    };
  }

  async getBySignal(signalId) {
    return this.repository.findBySignal(signalId);
  }

  async average(filters) {
    return this.repository.average(filters);
  }
}

export default ConfidenceService;