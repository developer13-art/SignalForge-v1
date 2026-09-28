/**
 * Trader Profile Repository
 *
 * @module signalforge/server/modules/traders/profile/repository
 */

import { TraderRepository } from '../trader.repository.js';

export class TraderProfileRepository {
  constructor(db = null) {
    this.traderRepository = new TraderRepository(db);
  }

  async findById(traderId) {
    return this.traderRepository.findById(traderId);
  }

  async findByUserId(userId) {
    return this.traderRepository.findByUserId(userId);
  }

  async findBySlug(slug) {
    return this.traderRepository.findBySlug(slug);
  }

  async list(filters, pagination) {
    return this.traderRepository.list(filters, pagination);
  }

  async update(traderId, data) {
    return this.traderRepository.update(traderId, data);
  }
}

export default TraderProfileRepository;