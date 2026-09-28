/**
 * Connection Log Repository
 *
 * @module signalforge/server/modules/brokers/logs/repository
 */
const { BrokerRepository } = require('../broker.repository.js');
class ConnectionLogRepository {
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
module.exports = ConnectionLogRepository;
module.exports.ConnectionLogRepository = ConnectionLogRepository;
