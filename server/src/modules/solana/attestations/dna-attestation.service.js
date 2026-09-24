/**
 * DNA Attestation Service
 *
 * Anchors Provider DNA confidence and version on Solana. Invoked
 * when a Provider DNA update stabilizes.
 *
 * @module server/modules/solana/attestations/dna-attestation.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { attestationRepository } from './attestation.repository';
import { attestationBuilderService } from './attestation-builder.service';
import { programConfigService } from '../config/program-config.service';
import { emitAttestationAnchored } from '../solana.events';

export async function createDnaAttestation({
  providerId,
  dnaConfidence,
  dnaVersion,
}) {
  if (!providerId || dnaConfidence === undefined) {
    throw new AppError('providerId and dnaConfidence are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const programId = programConfigService.tryGetProgramId({ key: 'attestation' });

  const { payload, attestationHash } = attestationBuilderService.buildDnaAttestationPayload({
    providerId,
    dnaConfidence,
    dnaVersion,
  });

  const record = await attestationRepository.insertAttestation({
    subjectType: 'PROVIDER',
    subjectId: providerId,
    attestationType: 'PROVIDER_DNA',
    attestationHash,
    publicData: payload.publicData,
    programId,
    status: 'PENDING',
  });

  logger.info({ attestationId: record.id, providerId, dnaVersion }, 'DNA attestation created');

  return {
    attestationId: record.id,
    subjectType: record.subject_type,
    subjectId: record.subject_id,
    attestationType: record.attestation_type,
    attestationHash: record.attestation_hash,
    status: record.status,
    createdAt: record.created_at,
  };
}

export async function markDnaAttestationAnchored({
  attestationId,
  txSignature,
  slot,
  blockTime,
}) {
  const updated = await attestationRepository.updateStatus({
    attestationId,
    status: 'CONFIRMED',
    txSignature,
    slot,
    blockTime,
  });

  if (!updated) {
    throw new AppError('Attestation not found', ERROR_CODES.NOT_FOUND, 404);
  }

  const record = await attestationRepository.findById({ attestationId });

  await emitAttestationAnchored({
    attestationId,
    subjectType: record.subject_type,
    subjectId: record.subject_id,
    txSignature,
    slot,
  }).catch((err) => logger.warn({ err }, 'Failed to emit attestation anchored event'));

  return { anchored: true, txSignature };
}

export const dnaAttestationService = {
  createDnaAttestation,
  markDnaAttestationAnchored,
};