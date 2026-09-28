/**
 * Trades Event Helpers
 *
 * @module signalforge/server/modules/trades/events
 */
const { getEventBus } = require('../../bootstrap/initEventBus.js');
const { TRADE_EVENTS } = require('./trade.constants.js');

function publish(eventType, payload, options = {}) {
  const bus = getEventBus();
  return bus.publish(eventType, payload, {
    source: 'trades',
    sourceVersion: '1.0.0',
    ...options,
  });
}
function emitTradeCreated(tradeId, userId, meta = {}) {
  return publish(TRADE_EVENTS.TRADE_CREATED, {
    tradeId,
    userId,
    createdAt: new Date().toISOString(),
    ...meta,
  });
}
function emitTradeUpdated(tradeId, userId, changes, meta = {}) {
  return publish(TRADE_EVENTS.TRADE_UPDATED, {
    tradeId,
    userId,
    changes,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitTradeClosed(tradeId, userId, meta = {}) {
  return publish(TRADE_EVENTS.TRADE_CLOSED, {
    tradeId,
    userId,
    closedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitTradeArchived(tradeId, userId, meta = {}) {
  return publish(TRADE_EVENTS.TRADE_ARCHIVED, {
    tradeId,
    userId,
    archivedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitManualOpen(tradeId, userId, meta = {}) {
  return publish(TRADE_EVENTS.MANUAL_OPEN, {
    tradeId,
    userId,
    openedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitManualClose(tradeId, userId, meta = {}) {
  return publish(TRADE_EVENTS.MANUAL_CLOSE, {
    tradeId,
    userId,
    closedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitManualModify(tradeId, userId, modifications, meta = {}) {
  return publish(TRADE_EVENTS.MANUAL_MODIFY, {
    tradeId,
    userId,
    modifications,
    modifiedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitManualIntervention(tradeId, userId, action, meta = {}) {
  return publish(TRADE_EVENTS.MANUAL_INTERVENTION, {
    tradeId,
    userId,
    action,
    interventionAt: new Date().toISOString(),
    ...meta,
  });
}
function emitTimelineRecorded(tradeId, eventId, meta = {}) {
  return publish(TRADE_EVENTS.TIMELINE_RECORDED, {
    tradeId,
    eventId,
    recordedAt: new Date().toISOString(),
    ...meta,
  });
}

module.exports.emitTradeCreated = emitTradeCreated;
module.exports.emitTradeUpdated = emitTradeUpdated;
module.exports.emitTradeClosed = emitTradeClosed;
module.exports.emitTradeArchived = emitTradeArchived;
module.exports.emitManualOpen = emitManualOpen;
module.exports.emitManualClose = emitManualClose;
module.exports.emitManualModify = emitManualModify;
module.exports.emitManualIntervention = emitManualIntervention;
module.exports.emitTimelineRecorded = emitTimelineRecorded;
