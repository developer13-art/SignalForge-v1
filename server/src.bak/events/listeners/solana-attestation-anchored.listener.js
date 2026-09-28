/**
 * Solana Attestation Anchored Listener
 *
 * @module server/events/listeners/solana-attestation-anchored.listener
 */

import { subscribeToEvent } from '../event-subscriber';
import { EVENT_TYPES } from '../event-types';
import { logger } from '../../lib/logger';

async function handler(envelope) {
  const payload = envelope.payload || {};

  logger.info(
    { attestationId: payload.attestationId, txSignature: payload.txSignature },
    'Solana attestation anchored',
  );
}

export function registerSolanaAttestationAnchoredListener() {
  subscribeToEvent(EVENT_TYPES.SOLANA_ATTESTATION_ANCHORED, handler);
}