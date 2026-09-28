/**
 * Signal Classification Event Helpers
 *
 * @module signalforge/server/modules/signal-classification/events
 */
const { getEventBus } = require('../../bootstrap/initEventBus.js');
const { CLASSIFICATION_EVENTS } = require('./classification.constants.js');

function publish(eventType, payload, options = {}) {
  const bus = getEventBus();
  return bus.publish(eventType, payload, {
    source: 'signal-classification',
    sourceVersion: '1.0.0',
    ...options,
  });
}
function emitClassificationStarted(messageId, meta = {}) {
  return publish(CLASSIFICATION_EVENTS.CLASSIFICATION_STARTED, {
    messageId,
    startedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitClassificationCompleted(messageId, result, meta = {}) {
  return publish(CLASSIFICATION_EVENTS.CLASSIFICATION_COMPLETED, {
    messageId,
    classification: result.classification,
    confidence: result.confidence,
    classifierKind: result.classifierKind,
    classifierVersion: result.classifierVersion || null,
    durationMs: result.durationMs || null,
    completedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitClassificationFailed(messageId, error, meta = {}) {
  return publish(CLASSIFICATION_EVENTS.CLASSIFICATION_FAILED, {
    messageId,
    error: typeof error === 'string' ? error : error.message,
    failedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitClassificationUncertain(messageId, result, meta = {}) {
  return publish(CLASSIFICATION_EVENTS.CLASSIFICATION_UNCERTAIN, {
    messageId,
    classification: result.classification,
    confidence: result.confidence,
    uncertainAt: new Date().toISOString(),
    ...meta,
  });
}
function emitClassifierThresholdHit(messageId, classification, confidence, threshold, meta = {}) {
  return publish(CLASSIFICATION_EVENTS.CLASSIFIER_THRESHOLD_HIT, {
    messageId,
    classification,
    confidence,
    threshold,
    hitAt: new Date().toISOString(),
    ...meta,
  });
}

module.exports.emitClassificationStarted = emitClassificationStarted;
module.exports.emitClassificationCompleted = emitClassificationCompleted;
module.exports.emitClassificationFailed = emitClassificationFailed;
module.exports.emitClassificationUncertain = emitClassificationUncertain;
module.exports.emitClassifierThresholdHit = emitClassifierThresholdHit;
