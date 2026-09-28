/**
 * Signal Collection Constants
 *
 * @module signalforge/server/modules/signal-collection/constants
 */

export const COLLECTION_EVENTS = Object.freeze({
  ITEM_ENQUEUED: 'collection.item.enqueued',
  ITEM_DEQUEUED: 'collection.item.dequeued',
  ITEM_PROCESSING: 'collection.item.processing',
  ITEM_PROCESSED: 'collection.item.processed',
  ITEM_FAILED: 'collection.item.failed',
  ITEM_DEAD_LETTERED: 'collection.item.dead_lettered',
  BATCH_STARTED: 'collection.batch.started',
  BATCH_COMPLETED: 'collection.batch.completed',
  QUEUE_DEPTH_WARNING: 'collection.queue.depth_warning',
});

export const COLLECTION_ITEM_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  QUEUED: 'QUEUED',
  PROCESSING: 'PROCESSING',
  PROCESSED: 'PROCESSED',
  FAILED: 'FAILED',
  DEAD_LETTER: 'DEAD_LETTER',
  CANCELLED: 'CANCELLED',
});

export const COLLECTION_PRIORITIES = Object.freeze({
  LOW: 10,
  NORMAL: 50,
  HIGH: 80,
  CRITICAL: 100,
});

export const DEFAULT_BATCH_SIZE = 25;
export const DEFAULT_POLL_INTERVAL_MS = 1000;
export const DEFAULT_MAX_ATTEMPTS = 3;
export const DEFAULT_ITEM_TIMEOUT_MS = 30000;
export const DEFAULT_QUEUE_DEPTH_WARNING = 10000;
export const DEFAULT_DEAD_LETTER_RETENTION_DAYS = 30;

export const COLLECTION_STAGES = Object.freeze({
  RECEIVED: 'RECEIVED',
  CLASSIFYING: 'CLASSIFYING',
  PARSING: 'PARSING',
  VALIDATING: 'VALIDATING',
  EXECUTING: 'EXECUTING',
  COMPLETED: 'COMPLETED',
}); 