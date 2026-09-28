/**
 * AI Log Service
 *
 * @module signalforge/server/modules/ai-signal-intelligence/logs/service
 */
const { AiLogRepository } = require('./ai-log.repository.js');
const { getLogger } = require('../../../bootstrap/initLogger.js');
class AiLogService {
  constructor(repository = null) {
    this.repository = repository || new AiLogRepository();
    this.logger = getLogger('ai-log');
  }

  async log(data) {
    try {
      return await this.repository.create(data);
    } catch (error) {
      this.logger.error({ err: error }, 'Failed to persist AI log');
      return null;
    }
  }

  async list(filters, pagination) {
    return this.repository.list(filters, pagination);
  }

  async sumCost(filters) {
    return this.repository.sumCost(filters);
  }
}
module.exports = AiLogService;
module.exports.AiLogService = AiLogService;
