/**
 * Withdrawal Request Repository
 *
 * @module signalforge/server/modules/withdrawals/requests/repository
 */

import { WithdrawalRepository } from '../withdrawal.repository.js';

export class WithdrawalRequestRepository {
  constructor(db = null) {
    this.withdrawalRepository = new WithdrawalRepository(db);
  }

  async create(data) {
    return this.withdrawalRepository.createRequest(data);
  }

  async findById(requestId) {
    return this.withdrawalRepository.findRequestById(requestId);
  }

  async findByIdForUser(requestId, userId) {
    return this.withdrawalRepository.findRequestByIdForUser(requestId, userId);
  }

  async list(filters, pagination) {
    return this.withdrawalRepository.listRequests(filters, pagination);
  }

  async update(requestId, data) {
    return this.withdrawalRepository.updateRequest(requestId, data);
  }

  async countActiveForUser(userId) {
    return this.withdrawalRepository.countActiveRequestsForUser(userId);
  }

  async sumForPeriod(userId, since, until) {
    return this.withdrawalRepository.sumWithdrawalsForPeriod(userId, since, until);
  }

  async countByStatus(filters) {
    return this.withdrawalRepository.countByStatus(filters);
  }

  async sumByMethodType(filters) {
    return this.withdrawalRepository.sumByMethodType(filters);
  }
}

export default WithdrawalRequestRepository;