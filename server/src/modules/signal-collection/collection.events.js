/**
 * Signal Collection Event Helpers
 *
 * @module signalforge/server/modules/signal-collection/events
 */

import { getEventBus } from '../../bootstrap/initEventBus.js';
import { COLLECTION_EVENTS } from './collection.constants.js';

function publish(eventType, payload, options = {}) {
  const bus = getEventBus();
  return bus.publish(eventType, payload, {
    source: 'signal-collection',
    sourceVersion: '1.0.0',
    ...options,
  });
}

export function emitItemEnqueued(itemId, sourceId, messageId, meta = {}) {
  return publish(COLLECTION_EVENTS.ITEM_ENQUEUED, {
    itemId,
    sourceId,
    messageId,
    enqueuedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitItemDequeued(itemId, meta = {}) {
  return publish(COLLECTION_EVENTS.ITEM_DEQUEUED, {
    itemId,
    dequeuedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitItemProcessing(itemId, meta = {}) {
  return publish(COLLECTION_EVENTS.ITEM_PROCESSING, {
    itemId,
    startedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitItemProcessed(itemId, meta = {}) {
  return publish(COLLECTION_EVENTS.ITEM_PROCESSED, {
    itemId,
    processedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitItemFailed(itemId, error, attempt, meta = {}) {
  return publish(COLLECTION_EVENTS.ITEM_FAILED, {
    itemId,
    error: typeof error === 'string' ? error : error.message,
    attempt,
    failedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitItemDeadLettered(itemId, error, meta = {}) {
  return publish(COLLECTION_EVENTS.ITEM_DEAD_LETTERED, {
    itemId,
    error: typeof error === 'string' ? error : error.message,
    deadLetteredAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitBatchStarted(batchId, itemCount, meta = {}) {
  return publish(COLLECTION_EVENTS.BATCH_STARTED, {
    batchId,
    itemCount,
    startedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitBatchCompleted(batchId, results, meta = {}) {
  return publish(COLLECTION_EVENTS.BATCH_COMPLETED, {
    batchId,
    results,
    completedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitQueueDepthWarning(depth, threshold, meta = {}) {
  return publish(COLLECTION_EVENTS.QUEUE_DEPTH_WARNING, {
    depth,
    threshold,
    warnedAt: new Date().toISOString(),
    ...meta,
  });
}

export { COLLECTION_EVENTS };