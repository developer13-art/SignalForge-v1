/**
 * AI Signal Intelligence Event Helpers
 *
 * @module signalforge/server/modules/ai-signal-intelligence/events
 */

import { getEventBus } from '../../bootstrap/initEventBus.js';
import { AI_EVENTS } from './ai.constants.js';

function publish(eventType, payload, options = {}) {
  const bus = getEventBus();
  return bus.publish(eventType, payload, {
    source: 'ai-signal-intelligence',
    sourceVersion: '1.0.0',
    ...options,
  });
}

export function emitParsingStarted(messageId, provider, meta = {}) {
  return publish(AI_EVENTS.PARSING_STARTED, {
    messageId,
    provider,
    startedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitParsingCompleted(messageId, result, meta = {}) {
  return publish(AI_EVENTS.PARSING_COMPLETED, {
    messageId,
    parserType: result.parserType,
    confidence: result.confidence,
    latencyMs: result.latencyMs,
    completedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitParsingFailed(messageId, error, meta = {}) {
  return publish(AI_EVENTS.PARSING_FAILED, {
    messageId,
    error: typeof error === 'string' ? error : error.message,
    failedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitParsingLowConfidence(messageId, confidence, threshold, meta = {}) {
  return publish(AI_EVENTS.PARSING_LOW_CONFIDENCE, {
    messageId,
    confidence,
    threshold,
    flaggedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitNormalizationCompleted(messageId, meta = {}) {
  return publish(AI_EVENTS.NORMALIZATION_COMPLETED, {
    messageId,
    normalizedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitConfidenceScored(signalId, confidence, level, meta = {}) {
  return publish(AI_EVENTS.CONFIDENCE_SCORED, {
    signalId,
    confidence,
    level,
    scoredAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitLlmRequest(provider, model, payload, meta = {}) {
  return publish(AI_EVENTS.LLM_REQUEST, {
    provider,
    model,
    purpose: payload?.purpose || null,
    requestedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitLlmResponse(provider, model, response, meta = {}) {
  return publish(AI_EVENTS.LLM_RESPONSE, {
    provider,
    model,
    latencyMs: response?.latencyMs || null,
    tokens: response?.totalTokens || null,
    respondedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitLlmError(provider, model, error, meta = {}) {
  return publish(AI_EVENTS.LLM_ERROR, {
    provider,
    model,
    error: typeof error === 'string' ? error : error.message,
    occurredAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitLlmRateLimited(provider, model, meta = {}) {
  return publish(AI_EVENTS.LLM_RATE_LIMITED, {
    provider,
    model,
    rateLimitedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitPromptInjectionDetected(messageId, reason, meta = {}) {
  return publish(AI_EVENTS.PROMPT_INJECTION_DETECTED, {
    messageId,
    reason,
    detectedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitSafetyFilterTriggered(messageId, action, reason, meta = {}) {
  return publish(AI_EVENTS.SAFETY_FILTER_TRIGGERED, {
    messageId,
    action,
    reason,
    triggeredAt: new Date().toISOString(),
    ...meta,
  });
}

export { AI_EVENTS };