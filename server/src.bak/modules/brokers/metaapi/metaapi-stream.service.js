/**
 * MetaApi Stream Service
 *
 * Manages the streaming connection to MetaApi for a broker account
 * and forwards incoming events to the event processor.
 *
 * @module signalforge/server/modules/brokers/metaapi/stream
 */

import { getLogger } from '../../../bootstrap/initLogger.js';
import { AccountRepository } from '../accounts/account.repository.js';
import { MetaApiEventProcessorService } from './metaapi-event-processor.service.js';
import {
  emitStreamConnected,
  emitStreamDisconnected,
  emitStreamError,
} from '../broker.events.js';

export class MetaApiStreamService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new AccountRepository();
    this.processor = dependencies.processor || new MetaApiEventProcessorService();
    this.client = dependencies.client || null;
    this.logger = getLogger('metaapi-stream');
    this.activeStreams = new Map();
  }

  async start(accountId) {
    if (this.activeStreams.has(accountId)) {
      return { started: true, already: true };
    }

    const account = await this.repository.findById(accountId);
    if (!account || !account.metaapi_account_id) {
      throw new Error('MetaApi account not found');
    }

    if (!this.client) {
      this.logger.warn({ accountId }, 'MetaApi stream client not configured');
      return { started: false, reason: 'CLIENT_NOT_CONFIGURED' };
    }

    let stopped = false;

    const handleEvent = async (eventType, event) => {
      if (stopped) {
        return;
      }
      try {
        await this.processor.process(accountId, eventType, event);
      } catch (error) {
        this.logger.error({ err: error, accountId, eventType }, 'Stream event failed');
        await emitStreamError(accountId, error);
      }
    };

    try {
      await this.client.startStreaming(
        account.metaapi_account_id,
        {
          onConnected: () => emitStreamConnected(accountId),
          onDisconnected: () => emitStreamDisconnected(accountId, 'connection_lost'),
          onPositions: (e) => handleEvent('positions', e),
          onOrders: (e) => handleEvent('orders', e),
          onAccountInformation: (e) => handleEvent('accountInformation', e),
          onSynchronization: (e) => handleEvent('synchronization', e),
          onError: (error) => emitStreamError(accountId, error),
        },
      );

      this.activeStreams.set(accountId, {
        stop: async () => {
          stopped = true;
          if (this.client && typeof this.client.stopStreaming === 'function') {
            await this.client.stopStreaming(account.metaapi_account_id);
          }
        },
      });

      return { started: true };
    } catch (error) {
      await emitStreamError(accountId, error);
      throw error;
    }
  }

  async stop(accountId) {
    const stream = this.activeStreams.get(accountId);
    if (!stream) {
      return { stopped: false, reason: 'NOT_RUNNING' };
    }
    await stream.stop();
    this.activeStreams.delete(accountId);
    return { stopped: true };
  }

  async stopAll() {
    for (const accountId of Array.from(this.activeStreams.keys())) {
      try {
        await this.stop(accountId);
      } catch (error) {
        this.logger.error({ err: error, accountId }, 'Failed to stop stream');
      }
    }
  }

  isStreaming(accountId) {
    return this.activeStreams.has(accountId);
  }

  listActive() {
    return Array.from(this.activeStreams.keys());
  }
}

export default MetaApiStreamService;