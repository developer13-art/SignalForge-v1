/**
 * Trade State Event Helpers
 *
 * @module signalforge/server/modules/trade-state/events
 */
const { getEventBus } = require('../../bootstrap/initEventBus.js');
const { TRADE_STATE_EVENTS, getEventSeverity } = require('./trade-state.constants.js');

function publish(eventType, payload, options = {}) {
  const bus = getEventBus();
  return bus.publish(eventType, payload, {
    source: 'trade-state',
    sourceVersion: '1.0.0',
    ...options,
  });
}
function emitTradeCreated(tradeId, userId, meta = {}) {
  return publish(TRADE_STATE_EVENTS.TRADE_CREATED, {
    tradeId,
    userId,
    createdAt: new Date().toISOString(),
    ...meta,
  });
}
function emitTradeUpdated(tradeId, changes, meta = {}) {
  return publish(TRADE_STATE_EVENTS.TRADE_UPDATED, {
    tradeId,
    changes,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitTradeClosed(tradeId, meta = {}) {
  return publish(TRADE_STATE_EVENTS.TRADE_CLOSED, {
    tradeId,
    closedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitTradeArchived(tradeId, meta = {}) {
  return publish(TRADE_STATE_EVENTS.TRADE_ARCHIVED, {
    tradeId,
    archivedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitStateChanged(tradeId, previousState, newState, actor, meta = {}) {
  return publish(TRADE_STATE_EVENTS.STATE_CHANGED, {
    tradeId,
    previousState,
    newState,
    actor,
    changedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitEventRecorded(tradeId, eventId, eventType, meta = {}) {
  return publish(TRADE_STATE_EVENTS.EVENT_RECORDED, {
    tradeId,
    eventId,
    eventType,
    severity: getEventSeverity(eventType),
    recordedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitTransitionRejected(tradeId, fromState, toState, reason, meta = {}) {
  return publish(TRADE_STATE_EVENTS.TRANSITION_REJECTED, {
    tradeId,
    fromState,
    toState,
    reason,
    rejectedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitInvalidState(tradeId, state, meta = {}) {
  return publish(TRADE_STATE_EVENTS.INVALID_STATE, {
    tradeId,
    state,
    detectedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitLifecycleStarted(tradeId, meta = {}) {
  return publish(TRADE_STATE_EVENTS.LIFECYCLE_STARTED, {
    tradeId,
    startedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitLifecycleCompleted(tradeId, meta = {}) {
  return publish(TRADE_STATE_EVENTS.LIFECYCLE_COMPLETED, {
    tradeId,
    completedAt: new Date().toISOString(),
    ...meta,
  });
}

module.exports.emitTradeCreated = emitTradeCreated;
module.exports.emitTradeUpdated = emitTradeUpdated;
module.exports.emitTradeClosed = emitTradeClosed;
module.exports.emitTradeArchived = emitTradeArchived;
module.exports.emitStateChanged = emitStateChanged;
module.exports.emitEventRecorded = emitEventRecorded;
module.exports.emitTransitionRejected = emitTransitionRejected;
module.exports.emitInvalidState = emitInvalidState;
module.exports.emitLifecycleStarted = emitLifecycleStarted;
module.exports.emitLifecycleCompleted = emitLifecycleCompleted;
