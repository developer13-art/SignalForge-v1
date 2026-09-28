/**
 * Signal Collection Queue Service
 *
 * High-level API for enqueueing and inspecting collection items.
 *
 * @module signalforge/server/modules/signal-collection/queue
 */

import { CollectionRepository } from './collection.repository.js';
import {
  COLLECTION_PRIORITIES,
  DEFAULT_MAX_ATTEMPTS,
  DEFAULT_QUEUE_DEPTH_WARNING,
} from './collection.constants.js';
import { emitItemEnqueued, emitQueueDepthWarning } from './collection.events.js';
import { getLogger } from '../../bootstrap/initLogger.js';

export class CollectionQueueService {
  constructor(repository = null) {
    this.repository = repository || new CollectionRepository();
    this.logger = getLogger('collection-queue');
    this.warnedAt = 0;
  }

  async enqueue(item) {
    const created = await this.repository.enqueue({
      sourceId: item.sourceId,
      messageId: item.messageId,
      userId: item.userId,
      priority: item.priority ?? COLLECTION_PRIORITIES.NORMAL,
      payload: item.payload || null,
      maxAttempts: item.maxAttempts ?? DEFAULT_MAX_ATTEMPTS,
      scheduledFor: item.scheduledFor || null,
    });

    if (!created) {
      this.logger.debug({ messageId: item.messageId }, 'Collection item already enqueued');
      return { enqueued: false, duplicate: true };
    }

    await emitItemEnqueued(created.id, item.sourceId, item.messageId);

    await this.checkQueueDepth();

    return { enqueued: true, itemId: created.id };
  }

  async checkQueueDepth() {
    const depth = await this.repository.countPending();
    if (depth >= DEFAULT_QUEUE_DEPTH_WARNING) {
      const now = Date.now();
      if (now - this.warnedAt > 60000) {
        this.warnedAt = now;
        await emitQueueDepthWarning(depth, DEFAULT_QUEUE_DEPTH_WARNING);
        this.logger.warn({ depth }, 'Collection queue depth warning');
      }
    }
    return depth;
  }

  async claim(batchSize) {
    return this.repository.claimBatch(batchSize);
  }

  async markProcessed(itemId) {
    return this.repository.markProcessed(itemId);
  }

  async markFailed(itemId, error, attempts, maxAttempts) {
    return this.repository.markFailed(itemId, error, attempts, maxAttempts);
  }

  async updateStage(itemId, stage) {
    return this.repository.updateStage(itemId, stage);
  }

  async cancel(itemId) {
    return this.repository.cancel(itemId);
  }

  async stats() {
    const byStatus = await this.repository.countByStatus();
    const pending = await this.repository.countPending();
    const processing = await this.repository.countProcessing();
    return { byStatus, pending, processing };
  }
}

export default CollectionQueueService;