/**
 * Signal Validation Event Helpers
 *
 * @module signalforge/server/modules/validation/events
 */
const { getEventBus } = require('../../bootstrap/initEventBus.js');
const { VALIDATION_EVENTS } = require('./validation.constants.js');

function publish(eventType, payload, options = {}) {
  const bus = getEventBus();
  return bus.publish(eventType, payload, {
    source: 'validation',
    sourceVersion: '1.0.0',
    ...options,
  });
}
function emitValidationStarted(signalId, meta = {}) {
  return publish(VALIDATION_EVENTS.VALIDATION_STARTED, {
    signalId,
    startedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitValidationCompleted(signalId, result, meta = {}) {
  return publish(VALIDATION_EVENTS.VALIDATION_COMPLETED, {
    signalId,
    result: result.result,
    failedChecks: result.failedChecks || [],
    durationMs: result.durationMs ?? null,
    completedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitValidationFailed(signalId, reason, meta = {}) {
  return publish(VALIDATION_EVENTS.VALIDATION_FAILED, {
    signalId,
    reason,
    failedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitValidationCheckPassed(signalId, checkName, meta = {}) {
  return publish(VALIDATION_EVENTS.VALIDATION_CHECK_PASSED, {
    signalId,
    checkName,
    passedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitValidationCheckFailed(signalId, checkName, reason, meta = {}) {
  return publish(VALIDATION_EVENTS.VALIDATION_CHECK_FAILED, {
    signalId,
    checkName,
    reason,
    failedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitDuplicateDetected(signalId, duplicateSignalId, meta = {}) {
  return publish(VALIDATION_EVENTS.DUPLICATE_DETECTED, {
    signalId,
    duplicateSignalId,
    detectedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitConflictDetected(signalId, conflictingSignalId, meta = {}) {
  return publish(VALIDATION_EVENTS.CONFLICT_DETECTED, {
    signalId,
    conflictingSignalId,
    detectedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitSignalExpired(signalId, meta = {}) {
  return publish(VALIDATION_EVENTS.SIGNAL_EXPIRED, {
    signalId,
    detectedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitMarketClosed(signalId, symbol, meta = {}) {
  return publish(VALIDATION_EVENTS.MARKET_CLOSED, {
    signalId,
    symbol,
    detectedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitSourceUntrusted(signalId, sourceId, trust, meta = {}) {
  return publish(VALIDATION_EVENTS.SOURCE_UNTRUSTED, {
    signalId,
    sourceId,
    trust,
    detectedAt: new Date().toISOString(),
    ...meta,
  });
}

module.exports.emitValidationStarted = emitValidationStarted;
module.exports.emitValidationCompleted = emitValidationCompleted;
module.exports.emitValidationFailed = emitValidationFailed;
module.exports.emitValidationCheckPassed = emitValidationCheckPassed;
module.exports.emitValidationCheckFailed = emitValidationCheckFailed;
module.exports.emitDuplicateDetected = emitDuplicateDetected;
module.exports.emitConflictDetected = emitConflictDetected;
module.exports.emitSignalExpired = emitSignalExpired;
module.exports.emitMarketClosed = emitMarketClosed;
module.exports.emitSourceUntrusted = emitSourceUntrusted;
