/**
 * Broker Account Repository
 *
 * @module signalforge/server/modules/brokers/accounts/repository
 */

import { BrokerRepository } from '../broker.repository.js';

export class AccountRepository {
  constructor(db = null) {
    this.brokerRepository = new BrokerRepository(db);
  }

  async create(data) {
    return this.brokerRepository.createAccount(data);
  }

  async findById(accountId) {
    return this.brokerRepository.findAccountById(accountId);
  }

  async findByIdForUser(accountId, userId) {
    return this.brokerRepository.findAccountByIdForUser(accountId, userId);
  }

  async findByMetaApiId(metaApiAccountId) {
    return this.brokerRepository.findAccountByMetaApiId(metaApiAccountId);
  }

  async findByUserAndNumber(userId, accountNumber, server) {
    return this.brokerRepository.findAccountByUserAndNumber(userId, accountNumber, server);
  }

  async listForUser(userId, filters) {
    return this.brokerRepository.listAccountsForUser(userId, filters);
  }

  async listConnected() {
    return this.brokerRepository.listConnectedAccounts();
  }

  async update(accountId, data) {
    return this.brokerRepository.updateAccount(accountId, data);
  }

  async delete(accountId) {
    return this.brokerRepository.deleteAccount(accountId);
  }

  async countForUser(userId) {
    return this.brokerRepository.countAccountsForUser(userId);
  }

  async createSnapshot(data) {
    return this.brokerRepository.createSnapshot(data);
  }

  async listSnapshots(accountId, filters, pagination) {
    return this.brokerRepository.listSnapshots(accountId, filters, pagination);
  }

  async createConnectionLog(data) {
    return this.brokerRepository.createConnectionLog(data);
  }

  async listConnectionLogs(accountId, pagination) {
    return this.brokerRepository.listConnectionLogs(accountId, pagination);
  }
}

export default AccountRepository;