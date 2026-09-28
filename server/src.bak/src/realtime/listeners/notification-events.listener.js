/**
 * Notification Events Realtime Listener
 *
 * @module server/realtime/listeners/notification-events.listener
 */
const { subscribeToEvent } = require('../../events/event-subscriber');
const { EVENT_TYPES } = require('../../events/event-types');
const { broadcaster } = require('../websocket-broadcaster');

const NOTIFICATION_EVENTS = [
  EVENT_TYPES.NOTIFICATION_SENT,
  EVENT_TYPES.NOTIFICATION_FAILED,
];

function handler(envelope) {
  const payload = envelope.payload || {};
  const userId = payload.userId || envelope.actorId;

  if (!userId) {
    return;
  }

  broadcaster.broadcastToUser({
    userId,
    channel: 'notification.events',
    event: envelope.eventType,
    payload,
  });
}
function registerNotificationEventsRealtimeListener() {
  for (const eventType of NOTIFICATION_EVENTS) {
    subscribeToEvent(eventType, handler);
  }
}
module.exports.registerNotificationEventsRealtimeListener = registerNotificationEventsRealtimeListener;
