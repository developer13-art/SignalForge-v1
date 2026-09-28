/**
 * Execution Request Repository
 *
 * @module signalforge/server/modules/execution/request/repository
 */

import { ExecutionRepository } from '../execution.repository.js';

export class ExecutionRequestRepository {
  constructor(db = null) {
    this.executionRepository = new ExecutionRepository(db);
  }

  async create(data) {
    return this.executionRepository.createRequest(data);
  }

  async findById(requestId) {
    return this.executionRepository.findRequestById(requestId);
  }

  async findByTrade(tradeId) {
    return this.executionRepository.findRequestsByTrade(tradeId);
  }

  async findPendingRetries() {
    return this.executionRepository.findPendingRetries();
  }

  async update(requestId, data) {
    return this.executionRepository.updateRequest(requestId, data);
  }

  async incrementAttempt(requestId) {
    return this.executionRepository.incrementAttempt(requestId);
  }

  async list(filters, pagination) {
    return this.executionRepository.listRequests(filters, pagination);
  }

  async countByStatus(filters) {
    return this.executionRepository.countByStatus(filters);
  }
}

export default ExecutionRequestRepository;  