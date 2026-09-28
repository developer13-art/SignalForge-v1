/**
 * Connection Log Service
 *
 * @module signalforge/server/modules/brokers/logs/service
 */
const { ConnectionLogRepository } = require('./connection-log.repository.js');
const { getLogger } = require('../../../bootstrap/initLogger.js');
class ConnectionLogService {
  constructor(repository = null) {
    this.repository = repository || new ConnectionLogRepository();
    this.logger = getLogger('broker-connection-log');
  }

  async log(data) {
    try {
      return await this.repository.create(data);
    } catch (error) {
      this.logger.error({ err: error }, 'Failed to persist connection log');
      return null;
    }
  }

  async list(accountId, pagination) {
    return this.repository.list(accountId, pagination);
  }
}
module.exports = ConnectionLogService;
module.exports.ConnectionLogService = ConnectionLogService;
