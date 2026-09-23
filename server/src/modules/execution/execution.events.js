/**
 * Execution Event Helpers
 *
 * @module signalforge/server/modules/execution/events
 */

import { getEventBus } from '../../bootstrap/initEventBus.js';
import { EXECUTION_EVENTS } from './execution.constants.js';

function publish(eventType, payload, options = {}) {
  const bus = getEventBus();
  return bus.publish(eventType, payload, {
    source: 'execution',
    sourceVersion: '1.0.0',
    ...options,
  });
}

export function emitRequestCreated(requestId, tradeId, userId, meta = {}) {
  return publish(EXECUTION_EVENTS.REQUEST_CREATED, {
    requestId,
    tradeId,
    userId,
    createdAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitRequestAccepted(requestId, brokerOrderId, meta = {}) {
  return publish(EXECUTION_EVENTS.REQUEST_ACCEPTED, {
    requestId,
    brokerOrderId,
    acceptedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitRequestRejected(requestId, reason, meta = {}) {
  return publish(EXECUTION_EVENTS.REQUEST_REJECTED, {
    requestId,
    reason,
    rejectedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitRequestRetried(requestId, attempt, meta = {}) {
  return publish(EXECUTION_EVENTS.REQUEST_RETRIED, {
    requestId,
    attempt,
    retriedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitRequestFailed(requestId, error, meta = {}) {
  return publish(EXECUTION_EVENTS.REQUEST_FAILED, {
    requestId,
    error: typeof error === 'string' ? error : error.message,
    failedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitRequestDeadLettered(requestId, error, meta = {}) {
  return publish(EXECUTION_EVENTS.REQUEST_DEAD_LETTERED, {
    requestId,
    error: typeof error === 'string' ? error : error.message,
    deadLetteredAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitOrderPlaced(requestId, brokerOrderId, meta = {}) {
  return publish(EXECUTION_EVENTS.ORDER_PLACED, {
    requestId,
    brokerOrderId,
    placedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitOrderAccepted(requestId, brokerOrderId, meta = {}) {
  return publish(EXECUTION_EVENTS.ORDER_ACCEPTED, {
    requestId,
    brokerOrderId,
    acceptedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitOrderRejected(requestId, reason, meta = {}) {
  return publish(EXECUTION_EVENTS.ORDER_REJECTED, {
    requestId,
    reason,
    rejectedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitPositionOpened(tradeId, meta = {}) {
  return publish(EXECUTION_EVENTS.POSITION_OPENED, {
    tradeId,
    openedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitPositionModified(tradeId, changes, meta = {}) {
  return publish(EXECUTION_EVENTS.POSITION_MODIFIED, {
    tradeId,
    changes,
    modifiedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitPositionClosed(tradeId, meta = {}) {
  return publish(EXECUTION_EVENTS.POSITION_CLOSED, {
    tradeId,
    closedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitPartialCloseExecuted(tradeId, percentage, meta = {}) {
  return publish(EXECUTION_EVENTS.PARTIAL_CLOSE_EXECUTED, {
    tradeId,
    percentage,
    executedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitPendingOrderPlaced(requestId, meta = {}) {
  return publish(EXECUTION_EVENTS.PENDING_ORDER_PLACED, {
    requestId,
    placedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitPendingOrderCancelled(requestId, meta = {}) {
  return publish(EXECUTION_EVENTS.PENDING_ORDER_CANCELLED, {
    requestId,
    cancelledAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitGatewayError(gateway, errorType, meta = {}) {
  return publish(EXECUTION_EVENTS.GATEWAY_ERROR, {
    gateway,
    errorType,
    occurredAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitGatewayTimeout(gateway, meta = {}) {
  return publish(EXECUTION_EVENTS.GATEWAY_TIMEOUT, {
    gateway,
    occurredAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitGatewayRateLimited(gateway, meta = {}) {
  return publish(EXECUTION_EVENTS.GATEWAY_RATE_LIMITED, {
    gateway,
    occurredAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitSyncCompleted(userId, brokerAccountId, summary, meta = {}) {
  return publish(EXECUTION_EVENTS.SYNC_COMPLETED, {
    userId,
    brokerAccountId,
    summary,
    syncedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitLatencyAlert(requestId, latencyMs, threshold, meta = {}) {
  return publish(EXECUTION_EVENTS.LATENCY_ALERT, {
    requestId,
    latencyMs,
    threshold,
    alertedAt: new Date().toISOString(),
    ...meta,
  });
}

export { EXECUTION_EVENTS };