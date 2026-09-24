/**
 * Provenance Anchor Service
 *
 * Orchestrates anchor operations on Solana for a provenance record.
 * The actual on-chain transaction is dispatched by the transactions
 * sub-module; this service just marks the record as pending and
 * emits the appropriate events.
 *
 * @module server/modules/solana/provenance/provenance-anchor.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { provenanceRepository } from './provenance.repository';
import { programConfigService } from '../config/program-config.service';
import { emitProvenanceAnchored } from '../solana.events';

export async function anchorProvenance({ provenanceId }) {
  if (!provenanceId) {
    throw new AppError('provenanceId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const record = await provenanceRepository.findById({ provenanceId });

  if (!record) {
    throw new AppError('Provenance record not found', ERROR_CODES.NOT_FOUND, 404);
  }

  if (record.status === 'CONFIRMED') {
    return { anchored: true, alreadyAnchored: true, txSignature: record.tx_signature };
  }

  const programId = programConfigService.tryGetProgramId({ key: 'provenance' });

  if (!programId) {
    logger.warn({ provenanceId }, 'Provenance program not configured; skipping anchor');
    return { anchored: false, reason: 'PROGRAM_NOT_CONFIGURED' };
  }

  await provenanceRepository.updateStatus({
    provenanceId,
    status: 'SUBMITTED',
  });

  logger.info({ provenanceId, programId }, 'Provenance marked as submitted for anchor');

  return { anchored: false, submitted: true };
}

export async function confirmAnchor({
  provenanceId,
  txSignature,
  slot,
  blockTime,
}) {
  if (!provenanceId || !txSignature) {
    throw new AppError('provenanceId and txSignature are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const updated = await provenanceRepository.updateStatus({
    provenanceId,
    status: 'CONFIRMED',
    txSignature,
    slot,
    blockTime,
  });

  if (!updated) {
    throw new AppError('Provenance record not found', ERROR_CODES.NOT_FOUND, 404);
  }

  const record = await provenanceRepository.findById({ provenanceId });

  await emitProvenanceAnchored({
    provenanceId,
    signalId: record.signal_id,
    txSignature,
    slot,
  }).catch((err) => logger.warn({ err }, 'Failed to emit provenance anchored event'));

  logger.info({ provenanceId, signalId: record.signal_id, txSignature }, 'Provenance anchored');

  return { anchored: true, txSignature };
}

export async function failAnchor({ provenanceId, reason }) {
  if (!provenanceId) {
    throw new AppError('provenanceId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const updated = await provenanceRepository.updateStatus({
    provenanceId,
    status: 'FAILED',
    failureReason: reason || 'UNKNOWN',
  });

  return { failed: updated };
}

export const provenanceAnchorService = {
  anchorProvenance,
  confirmAnchor,
  failAnchor,
};