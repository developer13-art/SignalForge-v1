/**
 * Behavior Timeline Repository
 *
 * @module signalforge/server/modules/trader-intelligence/timeline/repository
 */
const { IntelligenceRepository } = require('../intelligence.repository.js');
class BehaviorTimelineRepository {
  constructor(db = null) {
    this.intelligenceRepository = new IntelligenceRepository(db);
  }

  async create(data) {
    return this.intelligenceRepository.createTimelineEvent(data);
  }

  async list(userId, filters, pagination) {
    return this.intelligenceRepository.listTimeline(userId, filters, pagination);
  }

  async deleteForUser(userId) {
    return this.intelligenceRepository.deleteTimeline(userId);
  }
}
module.exports = BehaviorTimelineRepository;
module.exports.BehaviorTimelineRepository = BehaviorTimelineRepository;
