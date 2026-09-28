/**
 * Confidence Repository
 *
 * @module signalforge/server/modules/ai-signal-intelligence/confidence/repository
 */

import { AiRepository } from '../ai.repository.js';

export class ConfidenceRepository {
  constructor(db = null) {
    this.aiRepository = new AiRepository(db);
  }

  async create(data) {
    return this.aiRepository.createConfidenceScore(data);
  }

  async findBySignal(signalId) {
    return this.aiRepository.findConfidenceScoreBySignal(signalId);
  }

  async average(filters) {
    return this.aiRepository.averageConfidence(filters);
  }
}

export default ConfidenceRepository;