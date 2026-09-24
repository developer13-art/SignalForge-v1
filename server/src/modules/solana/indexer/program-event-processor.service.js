/**
 * Program Event Processor Service
 *
 * Transforms program events emitted by the platform's Solana programs
 * into domain events and persists the results. The processor is
 * idempotent so replayed events from a re-index do not cause
 * duplicate side effects.
 *
 * @module server/modules/solana/indexer/program-event-processor.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { db } from '../../../database';
import { nowIso } from '@signalforge/shared/utils/date.util';
import { attestationRepository } from '../attestations/attestation.repository';
import { provenanceRepository } from '../provenance/provenance.repository';
import { solanaPaymentRepository } from '../payments/solana-payment.repository';
import {
  emitAttestationAnchored,
  emitProvenanceAnchored,
  emitPaymentConfirmed,
} from '../solana.events';

const EVENT_TYPES = Object.freeze({
  ATTESTATION_CREATED: 'AttestationCreated',
  ATTESTATION_UPDATED: 'AttestationUpdated',
  ATTESTATION_REVOKED: 'AttestationRevoked',
  PROVENANCE_ANCHORED: 'ProvenanceAnchored',
  PAYMENT_CREATED: 'PaymentCreated',
  PAYMENT_CONFIRMED: 'PaymentConfirmed',
  PAYMENT_REFUNDED: 'PaymentRefunded',
});

async function recordIndexerEvent({ programId, eventType, txSignature, slot, payload }) {
  const { rows } = await db.query(
    `INSERT INTO solana_indexer_events
       (program_id, event_type, tx_signature, slot, payload, processed_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (tx_signature, event_type) DO NOTHING
     RETURNING id`,
    [programId, eventType, txSignature, slot, JSON.stringify(payload || {}), nowIso()],
  );

  return rows[0] || null;
}

async function handleAttestationCreated({ programId, txSignature, slot, payload }) {
  const attestationId = payload.attestationId || payload.attestation_id;

  if (!attestationId) {
    return { handled: false, reason: 'MISSING_ATTESTATION_ID' };
  }

  const existing = await attestationRepository.findById({ attestationId });

  if (!existing) {
    return { handled: false, reason: 'ATTESTATION_NOT_FOUND' };
  }

  await attestationRepository.updateStatus({
    attestationId,
    status: 'CONFIRMED',
    txSignature,
    slot,
  });

  await emitAttestationAnchored({
    attestationId,
    subjectType: existing.subject_type,
    subjectId: existing.subject_id,
    txSignature,
    slot,
  }).catch((err) => logger.warn({ err }, 'Failed to emit attestation anchored event'));

  return { handled: true, attestationId };
}

async function handleAttestationRevoked({ programId, txSignature, slot, payload }) {
  const attestationId = payload.attestationId || payload.attestation_id;

  if (!attestationId) {
    return { handled: false, reason: 'MISSING_ATTESTATION_ID' };
  }

  await attestationRepository.revoke({
    attestationId,
    reason: payload.reason || null,
  });

  return { handled: true, attestationId };
}

async function handleProvenanceAnchored({ programId, txSignature, slot, payload }) {
  const provenanceId = payload.provenanceId || payload.provenance_id;

  if (!provenanceId) {
    return { handled: false, reason: 'MISSING_PROVENANCE_ID' };
  }

  const existing = await provenanceRepository.findById({ provenanceId });

  if (!existing) {
    return { handled: false, reason: 'PROVENANCE_NOT_FOUND' };
  }

  await provenanceRepository.updateStatus({
    provenanceId,
    status: 'CONFIRMED',
    txSignature,
    slot,
  });

  await emitProvenanceAnchored({
    provenanceId,
    signalId: existing.signal_id,
    txSignature,
    slot,
  }).catch((err) => logger.warn({ err }, 'Failed to emit provenance anchored event'));

  return { handled: true, provenanceId };
}

async function handlePaymentConfirmed({ programId, txSignature, slot, payload }) {
  const paymentId = payload.paymentId || payload.payment_id;

  if (!paymentId) {
    return { handled: false, reason: 'MISSING_PAYMENT_ID' };
  }

  const existing = await solanaPaymentRepository.findById({ paymentId });

  if (!existing) {
    return { handled: false, reason: 'PAYMENT_NOT_FOUND' };
  }

  await solanaPaymentRepository.updateStatus({
    paymentId,
    status: 'CONFIRMED',
    txSignature,
    slot,
  });

  await emitPaymentConfirmed({
    paymentId,
    userId: existing.user_id,
    amount: Number(existing.amount),
    token: existing.token,
    txSignature,
  }).catch((err) => logger.warn({ err }, 'Failed to emit payment confirmed event'));

  return { handled: true, paymentId };
}

export async function processEvent({ programId, eventType, txSignature, slot, payload }) {
  if (!programId || !eventType || !txSignature) {
    throw new AppError(
      'programId, eventType, and txSignature are required',
      ERROR_CODES.VALIDATION_FAILED,
      400,
    );
  }

  const recorded = await recordIndexerEvent({ programId, eventType, txSignature, slot, payload });

  if (!recorded) {
    return { handled: false, reason: 'DUPLICATE_EVENT' };
  }

  switch (eventType) {
    case EVENT_TYPES.ATTESTATION_CREATED:
    case EVENT_TYPES.ATTESTATION_UPDATED:
      return handleAttestationCreated({ programId, txSignature, slot, payload });
    case EVENT_TYPES.ATTESTATION_REVOKED:
      return handleAttestationRevoked({ programId, txSignature, slot, payload });
    case EVENT_TYPES.PROVENANCE_ANCHORED:
      return handleProvenanceAnchored({ programId, txSignature, slot, payload });
    case EVENT_TYPES.PAYMENT_CONFIRMED:
      return handlePaymentConfirmed({ programId, txSignature, slot, payload });
    default:
      logger.debug({ eventType, txSignature }, 'Unsupported program event type');
      return { handled: false, reason: 'UNSUPPORTED_EVENT_TYPE' };
  }
}

export const programEventProcessorService = {
  processEvent,
  EVENT_TYPES,
};