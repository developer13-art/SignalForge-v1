/**
 * Risk Decision Logger Service
 *
 * @module signalforge/server/modules/risk/decision/logger
 */

import { getLogger } from '../../../bootstrap/initLogger.js';
import { DecisionRepository } from './decision.repository.js';

export class DecisionLoggerService {
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

export default DecisionLoggerService;