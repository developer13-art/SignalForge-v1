/**
 * Solana Events Realtime Listener
 *
 * @module server/realtime/listeners/solana-events.listener
 */
const { subscribeToEvent } = require('../../events/event-subscriber');
const { EVENT_TYPES } = require('../../events/event-types');
const { broadcaster } = require('../websocket-broadcaster');

const SOLANA_EVENTS = [
  EVENT_TYPES.SOLANA_WALLET_CONNECTED,
  EVENT_TYPES.SOLANA_WALLET_DISCONNECTED,
  EVENT_TYPES.SOLANA_ATTESTATION_ANCHORED,
  EVENT_TYPES.SOLANA_PROVENANCE_ANCHORED,
  EVENT_TYPES.SOLANA_TRANSACTION_CONFIRMED,
  EVENT_TYPES.SOLANA_TRANSACTION_FAILED,
  EVENT_TYPES.SOLANA_PAYMENT_CONFIRMED,
];

function handler(envelope) {
  const payload = envelope.payload || {};
  const userId = payload.userId || envelope.actorId;

  if (!userId) {
    return;
  }

  broadcaster.broadcastToUser({
    userId,
    channel: 'solana.events',
    event: envelope.eventType,
    payload,
  });
}
function registerSolanaEventsRealtimeListener() {
  for (const eventType of SOLANA_EVENTS) {
    subscribeToEvent(eventType, handler);
  }
}
module.exports.registerSolanaEventsRealtimeListener = registerSolanaEventsRealtimeListener;
