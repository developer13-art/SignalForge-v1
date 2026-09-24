/**
 * Follower Repository
 *
 * @module signalforge/server/modules/traders/followers/repository
 */

import { TraderRepository } from '../trader.repository.js';

export class FollowerRepository {
  constructor(db = null) {
    this.traderRepository = new TraderRepository(db);
  }

  async create(data) {
    return this.traderRepository.createFollower(data);
  }

  async findById(followerId) {
    return this.traderRepository.findFollowerById(followerId);
  }

  async find(traderId, followerId) {
    return this.traderRepository.findFollower(traderId, followerId);
  }

  async listByTrader(traderId, filters, pagination) {
    return this.traderRepository.listFollowers(traderId, filters, pagination);
  }

  async listByUser(followerId, filters, pagination) {
    return this.traderRepository.listFollowersByUser(followerId, filters, pagination);
  }

  async update(followerId, data) {
    return this.traderRepository.updateFollower(followerId, data);
  }

  async delete(followerId) {
    return this.traderRepository.deleteFollower(followerId);
  }

  async incrementTraderCount(traderId) {
    return this.traderRepository.incrementFollowerCount(traderId);
  }

  async decrementTraderCount(traderId) {
    return this.traderRepository.decrementFollowerCount(traderId);
  }
}

export default FollowerRepository;