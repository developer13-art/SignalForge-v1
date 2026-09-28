/**
 * Execution Log Service
 *
 * @module signalforge/server/modules/execution/logs/service
 */
const { ExecutionLogRepository } = require('./execution-log.repository.js');
const { getLogger } = require('../../../bootstrap/initLogger.js');
class ExecutionLogService {
  constructor(repository = null) {
    this.repository = repository || new ExecutionLogRepository();
    this.logger = getLogger('execution-log');
  }

  async log(data) {
    try {
      return await this.repository.create(data);
    } catch (error) {
      this.logger.error({ err: error }, 'Failed to persist execution log');
      return null;
    }
  }

  async list(filters, pagination) {
    return this.repository.list(filters, pagination);
  }

  async latencyStats(filters) {
    return this.repository.averageLatency(filters);
  }

  async symbolBreakdown(filters, limit) {
    return this.repository.countBySymbol(filters, limit);
  }
}
module.exports = ExecutionLogService;
module.exports.ExecutionLogService = ExecutionLogService;
