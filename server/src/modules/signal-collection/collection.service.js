/**
 * Signal Collection Service (facade)
 *
 * @module signalforge/server/modules/signal-collection/service
 */

import { CollectionRepository } from './collection.repository.js';
import { CollectionQueueService } from './collection-queue.service.js';
import { CollectionDispatcherService } from './collection-dispatcher.service.js';
import { CollectionWorker } from './collection.worker.js';
import { CollectionItemNotFoundError } from './collection.errors.js';

export class CollectionService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new CollectionRepository();
    this.queue = dependencies.queue || new CollectionQueueService(this.repository);
    this.dispatcher = dependencies.dispatcher || new CollectionDispatcherService();
    this.worker = dependencies.worker || new CollectionWorker({
      queue: this.queue,
      dispatcher: this.dispatcher,
    });
  }

  async enqueue(item) {
    return this.queue.enqueue(item);
  }

  async getItem(itemId) {
    const item = await this.repository.findById(itemId);
    if (!item) {
      throw new CollectionItemNotFoundError();
    }
    return this.serialize(item);
  }

  async getByMessageId(messageId) {
    const item = await this.repository.findByMessageId(messageId);
    if (!item) {
      throw new CollectionItemNotFoundError();
    }
    return this.serialize(item);
  }

  async cancel(itemId) {
    const item = await this.repository.findById(itemId);
    if (!item) {
      throw new CollectionItemNotFoundError();
    }
    await this.queue.cancel(itemId);
    return { cancelled: true };
  }

  async stats() {
    return this.queue.stats();
  }

  async cleanupDeadLetters(days) {
    return this.repository.cleanupDeadLetters(days);
  }

  startWorker() {
    this.worker.start();
  }

  async stopWorker() {
    return this.worker.stop();
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      sourceId: row.source_id,
      messageId: row.message_id,
      userId: row.user_id,
      status: row.status,
      stage: row.stage,
      priority: row.priority,
      attempts: row.attempts,
      maxAttempts: row.max_attempts,
      scheduledFor: row.scheduled_for,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      error: row.error,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export default CollectionService;