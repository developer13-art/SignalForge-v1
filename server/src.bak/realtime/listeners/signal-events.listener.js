/**
 * Signal Events Realtime Listener
 *
 * @module server/realtime/listeners/signal-events.listener
 */

import { subscribeToEvent } from '../../events/event-subscriber';
import { EVENT_TYPES } from '../../events/event-types';
import { broadcaster } from '../websocket-broadcaster';

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

export function registerSignalEventsRealtimeListener() {
  for (const eventType of SIGNAL_EVENTS) {
    subscribeToEvent(eventType, handler);
  }
}