/**
 * Confidence Repository
 *
 * @module signalforge/server/modules/ai-signal-intelligence/confidence/repository
 */
const { AiRepository } = require('../ai.repository.js');
class ConfidenceRepository {
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
module.exports = ConfidenceRepository;
module.exports.ConfidenceRepository = ConfidenceRepository;
