/**
 * Solana Events
 *
 * Event helpers for publishing Solana-related events on the platform
 * Event Bus.
 *
 * @module server/modules/solana/solana.events
 */

import { EVENT_TYPES } from '@signalforge/shared/constants/event-types';
import { publishEvent } from '../../events/event-publisher';

const SOURCE = 'solana.events';

export async function emitWalletConnected({ userId, walletAddress, isPrimary }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOLANA_WALLET_CONNECTED,
    source: SOURCE,
    actorId: userId,
    payload: {
      userId,
      walletAddress,
      isPrimary: Boolean(isPrimary),
      connectedAt: new Date().toISOString(),
    },
  });
}

export async function emitWalletDisconnected({ userId, walletAddress, reason }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOLANA_WALLET_DISCONNECTED,
    source: SOURCE,
    actorId: userId,
    payload: {
      userId,
      walletAddress,
      reason: reason || null,
      disconnectedAt: new Date().toISOString(),
    },
  });
}

export async function emitAttestationAnchored({ attestationId, subjectType, subjectId, txSignature, slot }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOLANA_ATTESTATION_ANCHORED,
    source: SOURCE,
    actorId: null,
    payload: {
      attestationId,
      subjectType,
      subjectId,
      txSignature,
      slot,
      anchoredAt: new Date().toISOString(),
    },
  });
}

export async function emitProvenanceAnchored({ provenanceId, signalId, txSignature, slot }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOLANA_PROVENANCE_ANCHORED,
    source: SOURCE,
    actorId: null,
    payload: {
      provenanceId,
      signalId,
      txSignature,
      slot,
      anchoredAt: new Date().toISOString(),
    },
  });
}

export async function emitTransactionConfirmed({ txSignature, purpose, slot }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOLANA_TRANSACTION_CONFIRMED,
    source: SOURCE,
    actorId: null,
    payload: {
      txSignature,
      purpose: purpose || null,
      slot,
      confirmedAt: new Date().toISOString(),
    },
  });
}

export async function emitTransactionFailed({ txSignature, purpose, reason }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOLANA_TRANSACTION_FAILED,
    source: SOURCE,
    actorId: null,
    payload: {
      txSignature,
      purpose: purpose || null,
      reason: reason || null,
      failedAt: new Date().toISOString(),
    },
  });
}

export async function emitPaymentConfirmed({ paymentId, userId, amount, token, txSignature }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOLANA_PAYMENT_CONFIRMED,
    source: SOURCE,
    actorId: userId,
    payload: {
      paymentId,
      userId,
      amount,
      token,
      txSignature,
      confirmedAt: new Date().toISOString(),
    },
  });
}

export const SOLANA_EVENT_NAMES = Object.freeze({
  WALLET_CONNECTED: EVENT_TYPES.SOLANA_WALLET_CONNECTED,
  WALLET_DISCONNECTED: EVENT_TYPES.SOLANA_WALLET_DISCONNECTED,
  ATTESTATION_ANCHORED: EVENT_TYPES.SOLANA_ATTESTATION_ANCHORED,
  PROVENANCE_ANCHORED: EVENT_TYPES.SOLANA_PROVENANCE_ANCHORED,
  TRANSACTION_CONFIRMED: EVENT_TYPES.SOLANA_TRANSACTION_CONFIRMED,
  TRANSACTION_FAILED: EVENT_TYPES.SOLANA_TRANSACTION_FAILED,
  PAYMENT_CONFIRMED: EVENT_TYPES.SOLANA_PAYMENT_CONFIRMED,
});