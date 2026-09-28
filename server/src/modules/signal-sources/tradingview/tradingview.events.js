/**
 * TradingView Events
 *
 * Defines TradingView-specific event names and helpers for publishing
 * TradingView integration events on the platform Event Bus.
 *
 * @module server/modules/signal-sources/tradingview/tradingview.events
 */
const { EVENT_TYPES } = require('@signalforge/shared/constants/event-types');
const { SOURCE_TYPES } = require('@signalforge/shared/constants/source-types');
const { publishEvent } = require('../../../events/event-publisher');

const SOURCE = 'tradingview.events';
async function emitTradingViewWebhookReceived({ userId, alertId, symbol, direction }) {
  return publishEvent({
    eventType: EVENT_TYPES.MESSAGE_RECEIVED,
    source: SOURCE,
    actorId: userId,
    payload: {
      sourceType: SOURCE_TYPES.TRADINGVIEW,
      userId,
      alertId: alertId || null,
      symbol: symbol || null,
      direction: direction || null,
      receivedAt: new Date().toISOString(),
    },
  });
}
async function emitTradingViewWebhookRejected({ userId, reason, alertId }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOURCE_WEBHOOK_REJECTED,
    source: SOURCE,
    actorId: userId,
    payload: {
      sourceType: SOURCE_TYPES.TRADINGVIEW,
      userId,
      alertId: alertId || null,
      reason: reason || null,
      rejectedAt: new Date().toISOString(),
    },
  });
}
async function emitTradingViewAlertRegistered({ userId, alertId, symbol }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOURCE_CHANNEL_OPT_IN,
    source: SOURCE,
    actorId: userId,
    payload: {
      sourceType: SOURCE_TYPES.TRADINGVIEW,
      userId,
      alertId: alertId || null,
      symbol: symbol || null,
      registeredAt: new Date().toISOString(),
    },
  });
}
async function emitTradingViewAlertRemoved({ userId, alertId }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOURCE_CHANNEL_OPT_OUT,
    source: SOURCE,
    actorId: userId,
    payload: {
      sourceType: SOURCE_TYPES.TRADINGVIEW,
      userId,
      alertId: alertId || null,
      removedAt: new Date().toISOString(),
    },
  });
}
async function emitTradingViewHealthCheck({ userId, healthy, details }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOURCE_HEALTH_CHECK,
    source: SOURCE,
    actorId: userId,
    payload: {
      sourceType: SOURCE_TYPES.TRADINGVIEW,
      userId,
      healthy,
      details: details || null,
      checkedAt: new Date().toISOString(),
    },
  });
}
const TRADINGVIEW_EVENT_NAMES = Object.freeze({
  WEBHOOK_RECEIVED: EVENT_TYPES.MESSAGE_RECEIVED,
  WEBHOOK_REJECTED: EVENT_TYPES.SOURCE_WEBHOOK_REJECTED,
  ALERT_REGISTERED: EVENT_TYPES.SOURCE_CHANNEL_OPT_IN,
  ALERT_REMOVED: EVENT_TYPES.SOURCE_CHANNEL_OPT_OUT,
  HEALTH_CHECK: EVENT_TYPES.SOURCE_HEALTH_CHECK,
});
module.exports.TRADINGVIEW_EVENT_NAMES = TRADINGVIEW_EVENT_NAMES;

module.exports.emitTradingViewWebhookReceived = emitTradingViewWebhookReceived;

module.exports.emitTradingViewWebhookRejected = emitTradingViewWebhookRejected;

module.exports.emitTradingViewAlertRegistered = emitTradingViewAlertRegistered;

module.exports.emitTradingViewAlertRemoved = emitTradingViewAlertRemoved;

module.exports.emitTradingViewHealthCheck = emitTradingViewHealthCheck;
