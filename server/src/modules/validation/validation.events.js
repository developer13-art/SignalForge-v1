/**
 * Signal Validation Event Helpers
 *
 * @module signalforge/server/modules/validation/events
 */

import { getEventBus } from '../../bootstrap/initEventBus.js';
import { VALIDATION_EVENTS } from './validation.constants.js';

function publish(eventType, payload, options = {}) {
  const bus = getEventBus();
  return bus.publish(eventType, payload, {
    source: 'validation',
    sourceVersion: '1.0.0',
    ...options,
  });
}

export function emitValidationStarted(signalId, meta = {}) {
  return publish(VALIDATION_EVENTS.VALIDATION_STARTED, {
    signalId,
    startedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitValidationCompleted(signalId, result, meta = {}) {
  return publish(VALIDATION_EVENTS.VALIDATION_COMPLETED, {
    signalId,
    result: result.result,
    failedChecks: result.failedChecks || [],
    durationMs: result.durationMs ?? null,
    completedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitValidationFailed(signalId, reason, meta = {}) {
  return publish(VALIDATION_EVENTS.VALIDATION_FAILED, {
    signalId,
    reason,
    failedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitValidationCheckPassed(signalId, checkName, meta = {}) {
  return publish(VALIDATION_EVENTS.VALIDATION_CHECK_PASSED, {
    signalId,
    checkName,
    passedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitValidationCheckFailed(signalId, checkName, reason, meta = {}) {
  return publish(VALIDATION_EVENTS.VALIDATION_CHECK_FAILED, {
    signalId,
    checkName,
    reason,
    failedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitDuplicateDetected(signalId, duplicateSignalId, meta = {}) {
  return publish(VALIDATION_EVENTS.DUPLICATE_DETECTED, {
    signalId,
    duplicateSignalId,
    detectedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitConflictDetected(signalId, conflictingSignalId, meta = {}) {
  return publish(VALIDATION_EVENTS.CONFLICT_DETECTED, {
    signalId,
    conflictingSignalId,
    detectedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitSignalExpired(signalId, meta = {}) {
  return publish(VALIDATION_EVENTS.SIGNAL_EXPIRED, {
    signalId,
    detectedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitMarketClosed(signalId, symbol, meta = {}) {
  return publish(VALIDATION_EVENTS.MARKET_CLOSED, {
    signalId,
    symbol,
    detectedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitSourceUntrusted(signalId, sourceId, trust, meta = {}) {
  return publish(VALIDATION_EVENTS.SOURCE_UNTRUSTED, {
    signalId,
    sourceId,
    trust,
    detectedAt: new Date().toISOString(),
    ...meta,
  });
}

export { VALIDATION_EVENTS };