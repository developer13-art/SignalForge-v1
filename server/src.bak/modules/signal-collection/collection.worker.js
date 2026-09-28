/**
 * Signal Collection Worker
 *
 * Runs inside the Express process and continuously claims collection
 * items from the database, dispatches them through the pipeline, and
 * records outcomes. Uses PostgreSQL `FOR UPDATE SKIP LOCKED` to allow
 * multiple concurrent workers without duplicate processing.
 *
 * @module signalforge/server/modules/signal-collection/worker
 */

import { getLogger } from '../../bootstrap/initLogger.js';
import { CollectionQueueService } from './collection-queue.service.js';
import { CollectionDispatcherService } from './collection-dispatcher.service.js';
import {
  DEFAULT_BATCH_SIZE,
  DEFAULT_POLL_INTERVAL_MS,
  DEFAULT_ITEM_TIMEOUT_MS,
} from './collection.constants.js';
import {
  emitItemProcessing,
  emitItemProcessed,
  emitItemFailed,
  emitItemDeadLettered,
  emitBatchStarted,
  emitBatchCompleted,
} from './collection.events.js';
import { COLLECTION_EVENTS } from './collection.constants.js';
import { getEventBus } from '../../bootstrap/initEventBus.js';

export class CollectionWorker {
  constructor(dependencies = {}) {
    this.queue = dependencies.queue || new CollectionQueueService();
    this.dispatcher = dependencies.dispatcher || new CollectionDispatcherService();
    this.batchSize = dependencies.batchSize || DEFAULT_BATCH_SIZE;
    this.pollIntervalMs = dependencies.pollIntervalMs || DEFAULT_POLL_INTERVAL_MS;
    this.itemTimeoutMs = dependencies.itemTimeoutMs || DEFAULT_ITEM_TIMEOUT_MS;
    this.logger = getLogger('collection-worker');

    this.intervalHandle = null;
    this.running = false;
    this.stopping = false;
    this.inFlight = new Set();

    this.registerDefaultStages();
  }

  registerDefaultStages() {
    this.dispatcher.registerStage('RECEIVED', async (item) => {
      await this.queue.updateStage(item.id, 'CLASSIFYING');
      await getEventBus().publish('collection.stage.received', {
        itemId: item.id,
        messageId: item.message_id,
        sourceId: item.source_id,
      });
      return { nextStage: 'COMPLETED' };
    });
  }

  withTimeout(promise, timeoutMs, label) {
    let timer;
    const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(() => {
        reject(new Error(`${label} exceeded ${timeoutMs}ms`));
      }, timeoutMs);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
  }

  async processItem(item) {
    const itemId = item.id;
    try {
      await emitItemProcessing(itemId);

      const result = await this.withTimeout(
        this.dispatcher.dispatch(item, {
          onStageChange: async (id, stage) => {
            await this.queue.updateStage(id, stage);
          },
        }),
        this.itemTimeoutMs,
        `item:${itemId}`,
      );

      if (result.completed) {
        await this.queue.markProcessed(itemId);
        await emitItemProcessed(itemId);
      } else {
        await this.queue.markFailed(itemId, new Error(result.reason || 'Stage failed'), item.attempts, item.max_attempts);
        await emitItemFailed(itemId, result.reason || 'Stage failed', item.attempts);
      }
    } catch (error) {
      this.logger.error({ err: error, itemId }, 'Collection item processing failed');
      await this.queue.markFailed(itemId, error, item.attempts, item.max_attempts);
      await emitItemFailed(itemId, error, item.attempts);

      if (item.attempts >= item.max_attempts) {
        await emitItemDeadLettered(itemId, error);
      }
    }
  }

  async tick() {
    if (this.running || this.stopping) {
      return;
    }
    this.running = true;

    try {
      const batch = await this.queue.claim(this.batchSize);
      if (batch.length === 0) {
        return;
      }

      const batchId = `batch:${Date.now()}`;
      await emitBatchStarted(batchId, batch.length);

      const outcomes = { processed: 0, failed: 0 };

      for (const item of batch) {
        if (this.stopping) {
          break;
        }
        const promise = this.processItem(item).finally(() => {
          this.inFlight.delete(promise);
        });
        this.inFlight.add(promise);
      }

      await Promise.allSettled(Array.from(this.inFlight));

      await emitBatchCompleted(batchId, outcomes);
    } catch (error) {
      this.logger.error({ err: error }, 'Collection worker tick failed');
    } finally {
      this.running = false;
    }
  }

  start() {
    if (this.intervalHandle) {
      return;
    }
    this.stopping = false;
    this.intervalHandle = setInterval(() => this.tick(), this.pollIntervalMs);
    if (this.intervalHandle.unref) {
      this.intervalHandle.unref();
    }
    setImmediate(() => this.tick());
    this.logger.info({ pollIntervalMs: this.pollIntervalMs }, 'Collection worker started');
  }

  async stop() {
    this.stopping = true;
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
    await Promise.allSettled(Array.from(this.inFlight));
    this.logger.info('Collection worker stopped');
  }
}

export { COLLECTION_EVENTS };

export default CollectionWorker;