/**
 * Connection Log Repository
 *
 * @module signalforge/server/modules/brokers/logs/repository
 */

import { BrokerRepository } from '../broker.repository.js';

export class ConnectionLogRepository {
  constructor(db = null) {
    this.brokerRepository = new BrokerRepository(db);
  }

  async create(data) {
    return this.brokerRepository.createConnectionLog(data);
  }

  async list(accountId, pagination) {
    return this.brokerRepository.listConnectionLogs(accountId, pagination);
  }
}

export default ConnectionLogRepository;