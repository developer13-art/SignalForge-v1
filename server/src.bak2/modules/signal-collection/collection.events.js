/**
 * Signal Collection Event Helpers
 *
 * @module signalforge/server/modules/signal-collection/events
 */
const { getEventBus } = require('../../bootstrap/initEventBus.js');
const { COLLECTION_EVENTS } = require('./collection.constants.js');

function publish(eventType, payload, options = {}) {
  const bus = getEventBus();
  return bus.publish(eventType, payload, {
    source: 'signal-collection',
    sourceVersion: '1.0.0',
    ...options,
  });
}
function emitItemEnqueued(itemId, sourceId, messageId, meta = {}) {
  return publish(COLLECTION_EVENTS.ITEM_ENQUEUED, {
    itemId,
    sourceId,
    messageId,
    enqueuedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitItemDequeued(itemId, meta = {}) {
  return publish(COLLECTION_EVENTS.ITEM_DEQUEUED, {
    itemId,
    dequeuedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitItemProcessing(itemId, meta = {}) {
  return publish(COLLECTION_EVENTS.ITEM_PROCESSING, {
    itemId,
    startedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitItemProcessed(itemId, meta = {}) {
  return publish(COLLECTION_EVENTS.ITEM_PROCESSED, {
    itemId,
    processedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitItemFailed(itemId, error, attempt, meta = {}) {
  return publish(COLLECTION_EVENTS.ITEM_FAILED, {
    itemId,
    error: typeof error === 'string' ? error : error.message,
    attempt,
    failedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitItemDeadLettered(itemId, error, meta = {}) {
  return publish(COLLECTION_EVENTS.ITEM_DEAD_LETTERED, {
    itemId,
    error: typeof error === 'string' ? error : error.message,
    deadLetteredAt: new Date().toISOString(),
    ...meta,
  });
}
function emitBatchStarted(batchId, itemCount, meta = {}) {
  return publish(COLLECTION_EVENTS.BATCH_STARTED, {
    batchId,
    itemCount,
    startedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitBatchCompleted(batchId, results, meta = {}) {
  return publish(COLLECTION_EVENTS.BATCH_COMPLETED, {
    batchId,
    results,
    completedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitQueueDepthWarning(depth, threshold, meta = {}) {
  return publish(COLLECTION_EVENTS.QUEUE_DEPTH_WARNING, {
    depth,
    threshold,
    warnedAt: new Date().toISOString(),
    ...meta,
  });
}

module.exports.emitItemEnqueued = emitItemEnqueued;
module.exports.emitItemDequeued = emitItemDequeued;
module.exports.emitItemProcessing = emitItemProcessing;
module.exports.emitItemProcessed = emitItemProcessed;
module.exports.emitItemFailed = emitItemFailed;
module.exports.emitItemDeadLettered = emitItemDeadLettered;
module.exports.emitBatchStarted = emitBatchStarted;
module.exports.emitBatchCompleted = emitBatchCompleted;
module.exports.emitQueueDepthWarning = emitQueueDepthWarning;
