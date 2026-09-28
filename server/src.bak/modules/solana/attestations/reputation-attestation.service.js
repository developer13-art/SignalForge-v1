/**
 * Reputation Attestation Service
 *
 * Anchors provider reputation metrics on Solana. Called by the
 * provider reputation workflow on a rolling schedule.
 *
 * @module server/modules/solana/attestations/reputation-attestation.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { attestationRepository } from './attestation.repository';
import { attestationBuilderService } from './attestation-builder.service';
import { programConfigService } from '../config/program-config.service';
import { emitAttestationAnchored } from '../solana.events';

export async function createReputationAttestation({
  providerId,
  consistencyScore,
  performanceScore,
}) {
  if (!providerId) {
    throw new AppError('providerId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const programId = programConfigService.tryGetProgramId({ key: 'attestation' });

  const { payload, attestationHash } = attestationBuilderService.buildReputationAttestationPayload({
    providerId,
    consistencyScore,
    performanceScore,
  });

  const record = await attestationRepository.insertAttestation({
    subjectType: 'PROVIDER',
    subjectId: providerId,
    attestationType: 'PROVIDER_REPUTATION',
    attestationHash,
    publicData: payload.publicData,
    programId,
    status: 'PENDING',
  });

  logger.info({ attestationId: record.id, providerId }, 'Reputation attestation created');

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

export async function markReputationAttestationAnchored({
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

export const reputationAttestationService = {
  createReputationAttestation,
  markReputationAttestationAnchored,
};