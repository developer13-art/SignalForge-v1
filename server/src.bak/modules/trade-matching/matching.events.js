/**
 * Trade Matching Event Helpers
 *
 * @module signalforge/server/modules/trade-matching/events
 */

import { getEventBus } from '../../bootstrap/initEventBus.js';
import { MATCHING_EVENTS } from './matching.constants.js';

function publish(eventType, payload, options = {}) {
  const bus = getEventBus();
  return bus.publish(eventType, payload, {
    source: 'trade-matching',
    sourceVersion: '1.0.0',
    ...options,
  });
}

export function emitMatchAttempted(messageId, providerId, meta = {}) {
  return publish(MATCHING_EVENTS.MATCH_ATTEMPTED, {
    messageId,
    providerId,
    attemptedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitMatchSucceeded(messageId, tradeId, strategy, confidence, meta = {}) {
  return publish(MATCHING_EVENTS.MATCH_SUCCEEDED, {
    messageId,
    tradeId,
    strategy,
    confidence,
    succeededAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitMatchFailed(messageId, reason, meta = {}) {
  return publish(MATCHING_EVENTS.MATCH_FAILED, {
    messageId,
    reason,
    failedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitMatchAmbiguous(messageId, candidates, meta = {}) {
  return publish(MATCHING_EVENTS.MATCH_AMBIGUOUS, {
    messageId,
    candidateCount: Array.isArray(candidates) ? candidates.length : 0,
    candidates,
    detectedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitManagementInstructionParsed(messageId, instructionType, meta = {}) {
  return publish(MATCHING_EVENTS.MANAGEMENT_INSTRUCTION_PARSED, {
    messageId,
    instructionType,
    parsedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitManagementInstructionApplied(tradeId, instructionType, meta = {}) {
  return publish(MATCHING_EVENTS.MANAGEMENT_INSTRUCTION_APPLIED, {
    tradeId,
    instructionType,
    appliedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitManagementInstructionFailed(tradeId, instructionType, error, meta = {}) {
  return publish(MATCHING_EVENTS.MANAGEMENT_INSTRUCTION_FAILED, {
    tradeId,
    instructionType,
    error: typeof error === 'string' ? error : error.message,
    failedAt: new Date().toISOString(),
    ...meta,
  });
}

export { MATCHING_EVENTS };