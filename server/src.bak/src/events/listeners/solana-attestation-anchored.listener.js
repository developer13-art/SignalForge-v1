/**
 * Solana Attestation Anchored Listener
 *
 * @module server/events/listeners/solana-attestation-anchored.listener
 */
const { subscribeToEvent } = require('../event-subscriber');
const { EVENT_TYPES } = require('../event-types');
const { logger } = require('../../lib/logger');

async function handler(envelope) {
  const payload = envelope.payload || {};

  logger.info(
    { attestationId: payload.attestationId, txSignature: payload.txSignature },
    'Solana attestation anchored',
  );
}
function registerSolanaAttestationAnchoredListener() {
  subscribeToEvent(EVENT_TYPES.SOLANA_ATTESTATION_ANCHORED, handler);
}
module.exports.registerSolanaAttestationAnchoredListener = registerSolanaAttestationAnchoredListener;
