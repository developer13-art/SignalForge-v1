/**
 * Attestation Service
 *
 * Top-level orchestration for provider attestations. Provides
 * create, list, revoke, and status-sweep operations.
 *
 * @module server/modules/solana/attestations/attestation.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { normalizePagination, buildPaginationMeta } from '@signalforge/shared/utils/pagination.util';
import { attestationRepository } from './attestation.repository';
import { attestationBuilderService } from './attestation-builder.service';
import { programConfigService } from '../config/program-config.service';
import { certificationAttestationService } from './certification-attestation.service';
import { dnaAttestationService } from './dna-attestation.service';
import { reputationAttestationService } from './reputation-attestation.service';

function mapAttestation(row) {
  return {
    attestationId: row.id,
    subjectType: row.subject_type,
    subjectId: row.subject_id,
    attestationType: row.attestation_type,
    attestationHash: row.attestation_hash,
    publicData: row.public_data ? JSON.parse(row.public_data) : null,
    programId: row.program_id,
    pda: row.pda,
    txSignature: row.tx_signature,
    slot: row.slot,
    blockTime: row.block_time,
    status: row.status,
    failureReason: row.failure_reason,
    revokedAt: row.revoked_at,
    revocationReason: row.revocation_reason,
    createdAt: row.created_at,
    confirmedAt: row.confirmed_at,
  };
}

export async function createAttestation({ subjectType, subjectId, attestationType, publicData, onChainData }) {
  if (!subjectType || !subjectId || !attestationType) {
    throw new AppError(
      'subjectType, subjectId, and attestationType are required',
      ERROR_CODES.VALIDATION_FAILED,
      400,
    );
  }

  const programId = programConfigService.tryGetProgramId({ key: 'attestation' });

  const { payload, attestationHash } = attestationBuilderService.buildAttestationPayload({
    subjectType,
    subjectId,
    attestationType,
    publicData,
    onChainData,
  });

  const record = await attestationRepository.insertAttestation({
    subjectType,
    subjectId,
    attestationType,
    attestationHash,
    publicData: payload.publicData,
    onChainData: payload.onChainData,
    programId,
    status: 'PENDING',
  });

  logger.info({ attestationId: record.id, subjectType, attestationType }, 'Attestation created');

  return mapAttestation(record);
}

export async function getAttestation({ attestationId }) {
  if (!attestationId) {
    throw new AppError('attestationId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const record = await attestationRepository.findById({ attestationId });

  if (!record) {
    throw new AppError('Attestation not found', ERROR_CODES.NOT_FOUND, 404);
  }

  return mapAttestation(record);
}

export async function listBySubject({ subjectType, subjectId, pagination = {} }) {
  if (!subjectType || !subjectId) {
    throw new AppError('subjectType and subjectId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { page, limit, offset } = normalizePagination(pagination);

  const result = await attestationRepository.listBySubjectPaged({
    subjectType,
    subjectId,
    pagination: { limit, offset },
  });

  return {
    items: result.items.map(mapAttestation),
    meta: buildPaginationMeta({ page, limit, total: result.total }),
  };
}

export async function revokeAttestation({ attestationId, reason }) {
  if (!attestationId) {
    throw new AppError('attestationId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const record = await attestationRepository.findById({ attestationId });

  if (!record) {
    throw new AppError('Attestation not found', ERROR_CODES.NOT_FOUND, 404);
  }

  if (record.status !== 'CONFIRMED') {
    throw new AppError('Only confirmed attestations can be revoked', ERROR_CODES.CONFLICT, 409);
  }

  await attestationRepository.revoke({ attestationId, reason });

  logger.info({ attestationId, reason }, 'Attestation revoked');

  return { revoked: true };
}

export async function listPendingAttestations({ limit = 50 }) {
  const rows = await attestationRepository.listPending({ limit });
  return rows.map(mapAttestation);
}

export async function markAttestationAnchored({ attestationId, txSignature, slot, blockTime }) {
  if (!attestationId || !txSignature) {
    throw new AppError('attestationId and txSignature are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

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

  return { anchored: true, txSignature };
}

export async function markAttestationFailed({ attestationId, reason }) {
  if (!attestationId) {
    throw new AppError('attestationId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const updated = await attestationRepository.updateStatus({
    attestationId,
    status: 'FAILED',
    failureReason: reason || 'UNKNOWN',
  });

  return { failed: updated };
}

export async function getStatusBreakdown() {
  const rows = await attestationRepository.countByStatus();

  const breakdown = {};
  for (const row of rows) {
    breakdown[row.status] = row.count;
  }

  return breakdown;
}

export const attestationService = {
  createAttestation,
  getAttestation,
  listBySubject,
  revokeAttestation,
  listPendingAttestations,
  markAttestationAnchored,
  markAttestationFailed,
  getStatusBreakdown,

  certification: certificationAttestationService,
  dna: dnaAttestationService,
  reputation: reputationAttestationService,
};