/**
 * Trade Events Realtime Listener
 *
 * @module server/realtime/listeners/trade-events.listener
 */
const { subscribeToEvent } = require('../../events/event-subscriber');
const { EVENT_TYPES } = require('../../events/event-types');
const { broadcaster } = require('../websocket-broadcaster');

const TRADE_EVENTS = [
  EVENT_TYPES.TRADE_EXECUTED,
  EVENT_TYPES.TRADE_OPENED,
  EVENT_TYPES.TRADE_UPDATED,
  EVENT_TYPES.TRADE_CLOSED,
  EVENT_TYPES.TRADE_ARCHIVED,
];

function handler(envelope) {
  const payload = envelope.payload || {};
  const userId = payload.userId || envelope.actorId;

  if (!userId) {
    return;
  }

  broadcaster.broadcastToUser({
    userId,
    channel: 'trade.events',
    event: envelope.eventType,
    payload,
  });
}
function registerTradeEventsRealtimeListener() {
  for (const eventType of TRADE_EVENTS) {
    subscribeToEvent(eventType, handler);
  }
}
module.exports.registerTradeEventsRealtimeListener = registerTradeEventsRealtimeListener;
