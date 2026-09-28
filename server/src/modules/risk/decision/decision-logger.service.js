/**
 * Risk Decision Logger Service
 *
 * @module signalforge/server/modules/risk/decision/logger
 */
const { getLogger } = require('../../../bootstrap/initLogger.js');
const { DecisionRepository } = require('./decision.repository.js');
class DecisionLoggerService {
  constructor(repository = null) {
    this.repository = repository || new DecisionRepository();
    this.logger = getLogger('risk-decision');
  }

  async logEvent(data) {
    try {
      return await this.repository.createEvent(data);
    } catch (error) {
      this.logger.error({ err: error }, 'Failed to log risk event');
      return null;
    }
  }
}
module.exports = DecisionLoggerService;
module.exports.DecisionLoggerService = DecisionLoggerService;
