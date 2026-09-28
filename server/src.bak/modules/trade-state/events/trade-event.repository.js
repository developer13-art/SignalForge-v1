/**
 * Trade Event Repository
 *
 * @module signalforge/server/modules/trade-state/events/repository
 */

import { TradeStateRepository } from '../trade-state.repository.js';

export class TradeEventRepository {
  constructor(db = null) {
    this.tradeStateRepository = new TradeStateRepository(db);
  }

  async create(data) {
    return this.tradeStateRepository.createEvent(data);
  }

  async findById(eventId) {
    return this.tradeStateRepository.findEventById(eventId);
  }

  async listByTrade(tradeId, filters, pagination) {
    return this.tradeStateRepository.listEventsByTrade(tradeId, filters, pagination);
  }

  async listByUser(userId, filters, pagination) {
    return this.tradeStateRepository.listEventsByUser(userId, filters, pagination);
  }

  async countByType(tradeId) {
    return this.tradeStateRepository.countEventsByType(tradeId);
  }
}

export default TradeEventRepository;