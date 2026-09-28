/**
 * Account Events Realtime Listener
 *
 * @module server/realtime/listeners/account-events.listener
 */
const { subscribeToEvent } = require('../../events/event-subscriber');
const { EVENT_TYPES } = require('../../events/event-types');
const { broadcaster } = require('../websocket-broadcaster');

const ACCOUNT_EVENTS = [
  EVENT_TYPES.BROKER_ACCOUNT_CONNECTED,
  EVENT_TYPES.BROKER_ACCOUNT_DISCONNECTED,
  EVENT_TYPES.BROKER_ACCOUNT_SYNCED,
];

function handler(envelope) {
  const payload = envelope.payload || {};
  const userId = payload.userId || envelope.actorId;

  if (!userId) {
    return;
  }

  broadcaster.broadcastToUser({
    userId,
    channel: 'account.events',
    event: envelope.eventType,
    payload,
  });
}
function registerAccountEventsRealtimeListener() {
  for (const eventType of ACCOUNT_EVENTS) {
    subscribeToEvent(eventType, handler);
  }
}
module.exports.registerAccountEventsRealtimeListener = registerAccountEventsRealtimeListener;
