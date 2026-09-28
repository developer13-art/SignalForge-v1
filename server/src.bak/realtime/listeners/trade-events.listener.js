/**
 * Trade Events Realtime Listener
 *
 * @module server/realtime/listeners/trade-events.listener
 */

import { subscribeToEvent } from '../../events/event-subscriber';
import { EVENT_TYPES } from '../../events/event-types';
import { broadcaster } from '../websocket-broadcaster';

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

export function registerTradeEventsRealtimeListener() {
  for (const eventType of TRADE_EVENTS) {
    subscribeToEvent(eventType, handler);
  }
}