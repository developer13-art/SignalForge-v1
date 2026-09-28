/**
 * Notification Events Realtime Listener
 *
 * @module server/realtime/listeners/notification-events.listener
 */

import { subscribeToEvent } from '../../events/event-subscriber';
import { EVENT_TYPES } from '../../events/event-types';
import { broadcaster } from '../websocket-broadcaster';

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

export function registerNotificationEventsRealtimeListener() {
  for (const eventType of NOTIFICATION_EVENTS) {
    subscribeToEvent(eventType, handler);
  }
}