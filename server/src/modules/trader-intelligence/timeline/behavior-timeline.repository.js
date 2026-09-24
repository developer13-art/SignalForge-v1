/**
 * Behavior Timeline Repository
 *
 * @module signalforge/server/modules/trader-intelligence/timeline/repository
 */

import { IntelligenceRepository } from '../intelligence.repository.js';

export class BehaviorTimelineRepository {
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

export default BehaviorTimelineRepository;