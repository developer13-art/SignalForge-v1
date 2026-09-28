/**
 * Execution Event Helpers
 *
 * @module signalforge/server/modules/execution/events
 */
const { getEventBus } = require('../../bootstrap/initEventBus.js');
const { EXECUTION_EVENTS } = require('./execution.constants.js');

function publish(eventType, payload, options = {}) {
  const bus = getEventBus();
  return bus.publish(eventType, payload, {
    source: 'execution',
    sourceVersion: '1.0.0',
    ...options,
  });
}
function emitRequestCreated(requestId, tradeId, userId, meta = {}) {
  return publish(EXECUTION_EVENTS.REQUEST_CREATED, {
    requestId,
    tradeId,
    userId,
    createdAt: new Date().toISOString(),
    ...meta,
  });
}
function emitRequestAccepted(requestId, brokerOrderId, meta = {}) {
  return publish(EXECUTION_EVENTS.REQUEST_ACCEPTED, {
    requestId,
    brokerOrderId,
    acceptedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitRequestRejected(requestId, reason, meta = {}) {
  return publish(EXECUTION_EVENTS.REQUEST_REJECTED, {
    requestId,
    reason,
    rejectedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitRequestRetried(requestId, attempt, meta = {}) {
  return publish(EXECUTION_EVENTS.REQUEST_RETRIED, {
    requestId,
    attempt,
    retriedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitRequestFailed(requestId, error, meta = {}) {
  return publish(EXECUTION_EVENTS.REQUEST_FAILED, {
    requestId,
    error: typeof error === 'string' ? error : error.message,
    failedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitRequestDeadLettered(requestId, error, meta = {}) {
  return publish(EXECUTION_EVENTS.REQUEST_DEAD_LETTERED, {
    requestId,
    error: typeof error === 'string' ? error : error.message,
    deadLetteredAt: new Date().toISOString(),
    ...meta,
  });
}
function emitOrderPlaced(requestId, brokerOrderId, meta = {}) {
  return publish(EXECUTION_EVENTS.ORDER_PLACED, {
    requestId,
    brokerOrderId,
    placedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitOrderAccepted(requestId, brokerOrderId, meta = {}) {
  return publish(EXECUTION_EVENTS.ORDER_ACCEPTED, {
    requestId,
    brokerOrderId,
    acceptedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitOrderRejected(requestId, reason, meta = {}) {
  return publish(EXECUTION_EVENTS.ORDER_REJECTED, {
    requestId,
    reason,
    rejectedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitPositionOpened(tradeId, meta = {}) {
  return publish(EXECUTION_EVENTS.POSITION_OPENED, {
    tradeId,
    openedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitPositionModified(tradeId, changes, meta = {}) {
  return publish(EXECUTION_EVENTS.POSITION_MODIFIED, {
    tradeId,
    changes,
    modifiedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitPositionClosed(tradeId, meta = {}) {
  return publish(EXECUTION_EVENTS.POSITION_CLOSED, {
    tradeId,
    closedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitPartialCloseExecuted(tradeId, percentage, meta = {}) {
  return publish(EXECUTION_EVENTS.PARTIAL_CLOSE_EXECUTED, {
    tradeId,
    percentage,
    executedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitPendingOrderPlaced(requestId, meta = {}) {
  return publish(EXECUTION_EVENTS.PENDING_ORDER_PLACED, {
    requestId,
    placedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitPendingOrderCancelled(requestId, meta = {}) {
  return publish(EXECUTION_EVENTS.PENDING_ORDER_CANCELLED, {
    requestId,
    cancelledAt: new Date().toISOString(),
    ...meta,
  });
}
function emitGatewayError(gateway, errorType, meta = {}) {
  return publish(EXECUTION_EVENTS.GATEWAY_ERROR, {
    gateway,
    errorType,
    occurredAt: new Date().toISOString(),
    ...meta,
  });
}
function emitGatewayTimeout(gateway, meta = {}) {
  return publish(EXECUTION_EVENTS.GATEWAY_TIMEOUT, {
    gateway,
    occurredAt: new Date().toISOString(),
    ...meta,
  });
}
function emitGatewayRateLimited(gateway, meta = {}) {
  return publish(EXECUTION_EVENTS.GATEWAY_RATE_LIMITED, {
    gateway,
    occurredAt: new Date().toISOString(),
    ...meta,
  });
}
function emitSyncCompleted(userId, brokerAccountId, summary, meta = {}) {
  return publish(EXECUTION_EVENTS.SYNC_COMPLETED, {
    userId,
    brokerAccountId,
    summary,
    syncedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitLatencyAlert(requestId, latencyMs, threshold, meta = {}) {
  return publish(EXECUTION_EVENTS.LATENCY_ALERT, {
    requestId,
    latencyMs,
    threshold,
    alertedAt: new Date().toISOString(),
    ...meta,
  });
}

module.exports.emitRequestCreated = emitRequestCreated;
module.exports.emitRequestAccepted = emitRequestAccepted;
module.exports.emitRequestRejected = emitRequestRejected;
module.exports.emitRequestRetried = emitRequestRetried;
module.exports.emitRequestFailed = emitRequestFailed;
module.exports.emitRequestDeadLettered = emitRequestDeadLettered;
module.exports.emitOrderPlaced = emitOrderPlaced;
module.exports.emitOrderAccepted = emitOrderAccepted;
module.exports.emitOrderRejected = emitOrderRejected;
module.exports.emitPositionOpened = emitPositionOpened;
module.exports.emitPositionModified = emitPositionModified;
module.exports.emitPositionClosed = emitPositionClosed;
module.exports.emitPartialCloseExecuted = emitPartialCloseExecuted;
module.exports.emitPendingOrderPlaced = emitPendingOrderPlaced;
module.exports.emitPendingOrderCancelled = emitPendingOrderCancelled;
module.exports.emitGatewayError = emitGatewayError;
module.exports.emitGatewayTimeout = emitGatewayTimeout;
module.exports.emitGatewayRateLimited = emitGatewayRateLimited;
module.exports.emitSyncCompleted = emitSyncCompleted;
module.exports.emitLatencyAlert = emitLatencyAlert;
