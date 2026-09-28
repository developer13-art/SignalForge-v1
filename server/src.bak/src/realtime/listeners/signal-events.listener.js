/**
 * Signal Events Realtime Listener
 *
 * @module server/realtime/listeners/signal-events.listener
 */
const { subscribeToEvent } = require('../../events/event-subscriber');
const { EVENT_TYPES } = require('../../events/event-types');
const { broadcaster } = require('../websocket-broadcaster');

const SIGNAL_EVENTS = [
  EVENT_TYPES.SIGNAL_DETECTED,
  EVENT_TYPES.SIGNAL_ANALYZED,
  EVENT_TYPES.SIGNAL_VALIDATED,
  EVENT_TYPES.SIGNAL_VALIDATION_FAILED,
  EVENT_TYPES.SIGNAL_UPDATED,
  EVENT_TYPES.SIGNAL_DELETED,
];

function handler(envelope) {
  const payload = envelope.payload || {};
  const userId = payload.userId || envelope.actorId;

  if (!userId) {
    return;
  }

  broadcaster.broadcastToUser({
    userId,
    channel: 'signal.events',
    event: envelope.eventType,
    payload,
  });
}
function registerSignalEventsRealtimeListener() {
  for (const eventType of SIGNAL_EVENTS) {
    subscribeToEvent(eventType, handler);
  }
}
module.exports.registerSignalEventsRealtimeListener = registerSignalEventsRealtimeListener;
