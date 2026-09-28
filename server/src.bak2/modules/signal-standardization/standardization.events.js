/**
 * Signal Standardization Event Helpers
 *
 * @module signalforge/server/modules/signal-standardization/events
 */
const { getEventBus } = require('../../bootstrap/initEventBus.js');
const { STANDARDIZATION_EVENTS } = require('./standardization.constants.js');

function publish(eventType, payload, options = {}) {
  const bus = getEventBus();
  return bus.publish(eventType, payload, {
    source: 'signal-standardization',
    sourceVersion: '1.0.0',
    ...options,
  });
}
function emitStandardizationStarted(messageId, meta = {}) {
  return publish(STANDARDIZATION_EVENTS.STANDARDIZATION_STARTED, {
    messageId,
    startedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitStandardizationCompleted(signalId, meta = {}) {
  return publish(STANDARDIZATION_EVENTS.STANDARDIZATION_COMPLETED, {
    signalId,
    completedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitStandardizationFailed(messageId, error, meta = {}) {
  return publish(STANDARDIZATION_EVENTS.STANDARDIZATION_FAILED, {
    messageId,
    error: typeof error === 'string' ? error : error.message,
    failedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitFingerprintComputed(signalId, fingerprint, meta = {}) {
  return publish(STANDARDIZATION_EVENTS.FINGERPRINT_COMPUTED, {
    signalId,
    fingerprint,
    computedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitDuplicateFingerprintDetected(signalId, existingSignalId, fingerprint, meta = {}) {
  return publish(STANDARDIZATION_EVENTS.DUPLICATE_FINGERPRINT_DETECTED, {
    signalId,
    existingSignalId,
    fingerprint,
    detectedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitCanonicalFormApplied(signalId, meta = {}) {
  return publish(STANDARDIZATION_EVENTS.CANONICAL_FORM_APPLIED, {
    signalId,
    appliedAt: new Date().toISOString(),
    ...meta,
  });
}

module.exports.emitStandardizationStarted = emitStandardizationStarted;
module.exports.emitStandardizationCompleted = emitStandardizationCompleted;
module.exports.emitStandardizationFailed = emitStandardizationFailed;
module.exports.emitFingerprintComputed = emitFingerprintComputed;
module.exports.emitDuplicateFingerprintDetected = emitDuplicateFingerprintDetected;
module.exports.emitCanonicalFormApplied = emitCanonicalFormApplied;
