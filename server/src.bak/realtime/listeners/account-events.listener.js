/**
 * Account Events Realtime Listener
 *
 * @module server/realtime/listeners/account-events.listener
 */

import { subscribeToEvent } from '../../events/event-subscriber';
import { EVENT_TYPES } from '../../events/event-types';
import { broadcaster } from '../websocket-broadcaster';

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

export function registerAccountEventsRealtimeListener() {
  for (const eventType of ACCOUNT_EVENTS) {
    subscribeToEvent(eventType, handler);
  }
}