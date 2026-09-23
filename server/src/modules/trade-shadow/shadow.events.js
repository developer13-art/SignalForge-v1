/**
 * Trade Shadow Event Helpers
 *
 * @module signalforge/server/modules/trade-shadow/events
 */

import { getEventBus } from '../../bootstrap/initEventBus.js';
import { SHADOW_EVENTS } from './shadow.constants.js';

function publish(eventType, payload, options = {}) {
  const bus = getEventBus();
  return bus.publish(eventType, payload, {
    source: 'trade-shadow',
    sourceVersion: '1.0.0',
    ...options,
  });
}

export function emitShadowCreated(shadowId, userId, meta = {}) {
  return publish(SHADOW_EVENTS.SHADOW_CREATED, {
    shadowId,
    userId,
    createdAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitShadowUpdated(shadowId, userId, changes, meta = {}) {
  return publish(SHADOW_EVENTS.SHADOW_UPDATED, {
    shadowId,
    userId,
    changes,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitShadowCompleted(shadowId, userId, outcome, meta = {}) {
  return publish(SHADOW_EVENTS.SHADOW_COMPLETED, {
    shadowId,
    userId,
    outcome,
    completedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitDivergenceDetected(shadowId, userId, divergenceType, meta = {}) {
  return publish(SHADOW_EVENTS.DIVERGENCE_DETECTED, {
    shadowId,
    userId,
    divergenceType,
    detectedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitMissedProfitDetected(shadowId, userId, missedProfit, meta = {}) {
  return publish(SHADOW_EVENTS.MISSED_PROFIT_DETECTED, {
    shadowId,
    userId,
    missedProfit,
    detectedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitBetterExitDetected(shadowId, userId, difference, meta = {}) {
  return publish(SHADOW_EVENTS.BETTER_EXIT_DETECTED, {
    shadowId,
    userId,
    difference,
    detectedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitBehaviorFeedbackGenerated(userId, feedback, meta = {}) {
  return publish(SHADOW_EVENTS.BEHAVIOR_FEEDBACK_GENERATED, {
    userId,
    feedback,
    generatedAt: new Date().toISOString(),
    ...meta,
  });
}

export { SHADOW_EVENTS };