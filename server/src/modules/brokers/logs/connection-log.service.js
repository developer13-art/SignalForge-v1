/**
 * Connection Log Service
 *
 * @module signalforge/server/modules/brokers/logs/service
 */

import { ConnectionLogRepository } from './connection-log.repository.js';
import { getLogger } from '../../../bootstrap/initLogger.js';

export class ConnectionLogService {
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

export default ConnectionLogService;