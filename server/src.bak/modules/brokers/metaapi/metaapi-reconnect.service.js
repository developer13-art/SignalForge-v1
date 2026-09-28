/**
 * MetaApi Reconnect Service
 *
 * @module signalforge/server/modules/brokers/metaapi/reconnect
 */

import { getLogger } from '../../../bootstrap/initLogger.js';
import {
  DEFAULT_RECONNECT_BASE_DELAY_MS,
  DEFAULT_MAX_RECONNECT_ATTEMPTS,
} from '../broker.constants.js';
import { emitStreamReconnecting } from '../broker.events.js';

export class MetaApiReconnectService {
  constructor(dependencies = {}) {
    this.baseDelayMs = dependencies.baseDelayMs || DEFAULT_RECONNECT_BASE_DELAY_MS;
    this.maxAttempts = dependencies.maxAttempts || DEFAULT_MAX_RECONNECT_ATTEMPTS;
    this.logger = getLogger('metaapi-reconnect');
  }

  calculateDelay(attempt) {
    const exponential = this.baseDelayMs * Math.pow(2, attempt - 1);
    const capped = Math.min(exponential, 60000);
    const jitter = Math.random() * capped * 0.25;
    return Math.round(capped + jitter);
  }

  async attemptReconnect(accountId, reconnectFn) {
    let attempt = 0;
    while (attempt < this.maxAttempts) {
      attempt++;
      const delay = this.calculateDelay(attempt);
      await emitStreamReconnecting(accountId, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
      try {
        await reconnectFn();
        this.logger.info({ accountId, attempt }, 'Reconnect succeeded');
        return { reconnected: true, attempts: attempt };
      } catch (error) {
        this.logger.warn(
          { err: error, accountId, attempt },
          'Reconnect attempt failed',
        );
      }
    }
    this.logger.error({ accountId }, 'Reconnect attempts exhausted');
    return { reconnected: false, attempts: attempt };
  }
}

export default MetaApiReconnectService;