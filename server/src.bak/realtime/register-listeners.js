/**
 * Register Realtime Listeners
 *
 * Subscribes the realtime broadcaster to platform events so that the
 * appropriate user sockets receive updates as soon as events are
 * published.
 *
 * @module server/realtime/register-listeners
 */

import { subscribeToEvent } from '../events/event-subscriber';
import { EVENT_TYPES } from '../events/event-types';
import { broadcaster } from './websocket-broadcaster';

const ROUTES = Object.freeze({
  [EVENT_TYPES.SIGNAL_DETECTED]: 'signal.events',
  [EVENT_TYPES.SIGNAL_UPDATED]: 'signal.events',
  [EVENT_TYPES.SIGNAL_DELETED]: 'signal.events',
  [EVENT_TYPES.SIGNAL_VALIDATED]: 'signal.events',
  [EVENT_TYPES.SIGNAL_VALIDATION_FAILED]: 'signal.events',
  [EVENT_TYPES.RISK_APPROVED]: 'trade.events',
  [EVENT_TYPES.RISK_REJECTED]: 'trade.events',
  [EVENT_TYPES.TRADE_EXECUTED]: 'trade.events',
  [EVENT_TYPES.TRADE_OPENED]: 'trade.events',
  [EVENT_TYPES.TRADE_UPDATED]: 'trade.events',
  [EVENT_TYPES.TRADE_CLOSED]: 'trade.events',
  [EVENT_TYPES.BROKER_ACCOUNT_CONNECTED]: 'account.events',
  [EVENT_TYPES.BROKER_ACCOUNT_DISCONNECTED]: 'account.events',
  [EVENT_TYPES.BROKER_ACCOUNT_SYNCED]: 'account.events',
  [EVENT_TYPES.NOTIFICATION_SENT]: 'notification.events',
  [EVENT_TYPES.NOTIFICATION_FAILED]: 'notification.events',
  [EVENT_TYPES.SOLANA_WALLET_CONNECTED]: 'solana.events',
  [EVENT_TYPES.SOLANA_WALLET_DISCONNECTED]: 'solana.events',
  [EVENT_TYPES.SOLANA_ATTESTATION_ANCHORED]: 'solana.events',
  [EVENT_TYPES.SOLANA_PROVENANCE_ANCHORED]: 'solana.events',
  [EVENT_TYPES.SOLANA_PAYMENT_CONFIRMED]: 'solana.events',
});

let registered = false;

export function registerRealtimeListeners() {
  if (registered) {
    return;
  }

  for (const [eventType, channel] of Object.entries(ROUTES)) {
    subscribeToEvent(eventType, async (envelope) => {
      const payload = envelope.payload || {};
      const userId = payload.userId || envelope.actorId;

      if (!userId) {
        return;
      }

      broadcaster.broadcastToUser({
        userId,
        channel,
        event: eventType,
        payload,
      });
    });
  }

  registered = true;
}

export const realtimeListeners = {
  registerRealtimeListeners,
  ROUTES,
};