/**
 * Execution Log Repository
 *
 * @module signalforge/server/modules/execution/logs/repository
 */
const { ExecutionRepository } = require('../execution.repository.js');
class ExecutionLogRepository {
  constructor(db = null) {
    this.executionRepository = new ExecutionRepository(db);
  }

  async create(data) {
    return this.executionRepository.createLog(data);
  }

  async list(filters, pagination) {
    return this.executionRepository.listLogs(filters, pagination);
  }

  async averageLatency(filters) {
    return this.executionRepository.averageLatency(filters);
  }

  async countBySymbol(filters, limit) {
    return this.executionRepository.countBySymbol(filters, limit);
  }
}
module.exports = ExecutionLogRepository;
module.exports.ExecutionLogRepository = ExecutionLogRepository;
