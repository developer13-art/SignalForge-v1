/**
 * Provenance Service
 *
 * Top-level orchestration for AI signal provenance: creating records,
 * listing by provider, and coordinating anchor operations.
 *
 * @module server/modules/solana/provenance/provenance.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { normalizePagination, buildPaginationMeta } from '@signalforge/shared/utils/pagination.util';
import { provenanceRepository } from './provenance.repository';
import { signalHashService } from './signal-hash.service';
import { provenanceAnchorService } from './provenance-anchor.service';
import { programConfigService } from '../config/program-config.service';

function mapProvenance(row) {
  return {
    provenanceId: row.id,
    signalId: row.signal_id,
    providerId: row.provider_id,
    processingHash: row.processing_hash,
    signalHash: row.signal_hash,
    aiVersion: row.ai_version,
    modelId: row.model_id,
    parserType: row.parser_type,
    processingSteps: row.processing_steps ? JSON.parse(row.processing_steps) : [],
    publicData: row.public_data ? JSON.parse(row.public_data) : null,
    programId: row.program_id,
    txSignature: row.tx_signature,
    slot: row.slot,
    blockTime: row.block_time,
    status: row.status,
    failureReason: row.failure_reason,
    anchoredAt: row.anchored_at,
    createdAt: row.created_at,
  };
}

export async function createProvenance({
  signal,
  aiVersion,
  parserType,
  modelId,
  processingSteps,
}) {
  if (!signal || !signal.signalId) {
    throw new AppError('signal with signalId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!aiVersion) {
    throw new AppError('aiVersion is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const existing = await provenanceRepository.findBySignalId({ signalId: signal.signalId });

  if (existing && existing.ai_version === aiVersion) {
    return mapProvenance(existing);
  }

  const processingHash = signalHashService.computeProcessingHash({
    signal,
    aiVersion,
    parserType,
    modelId,
    processingSteps,
  });

  const signalHash = signalHashService.computeSignalHash({ signal });

  const programId = programConfigService.tryGetProgramId({ key: 'provenance' });

  const record = await provenanceRepository.insertProvenance({
    signalId: signal.signalId,
    providerId: signal.providerId || null,
    processingHash,
    signalHash,
    aiVersion,
    modelId: modelId || null,
    parserType: parserType || null,
    processingSteps,
    publicData: {
      signalId: signal.signalId,
      providerId: signal.providerId || null,
      processingHash,
      aiVersion,
      anchoredAt: new Date().toISOString(),
    },
    programId,
    status: 'PENDING',
  });

  logger.info({ provenanceId: record.id, signalId: signal.signalId }, 'Provenance record created');

  return mapProvenance(record);
}

export async function getProvenance({ provenanceId }) {
  if (!provenanceId) {
    throw new AppError('provenanceId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const record = await provenanceRepository.findById({ provenanceId });

  if (!record) {
    throw new AppError('Provenance record not found', ERROR_CODES.NOT_FOUND, 404);
  }

  return mapProvenance(record);
}

export async function getProvenanceBySignal({ signalId }) {
  if (!signalId) {
    throw new AppError('signalId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const record = await provenanceRepository.findBySignalId({ signalId });

  if (!record) {
    throw new AppError('Provenance record not found', ERROR_CODES.NOT_FOUND, 404);
  }

  return mapProvenance(record);
}

export async function listByProvider({ providerId, pagination = {} }) {
  if (!providerId) {
    throw new AppError('providerId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { page, limit, offset } = normalizePagination(pagination);

  const result = await provenanceRepository.listByProviderPaged({
    providerId,
    pagination: { limit, offset },
  });

  return {
    items: result.items.map(mapProvenance),
    meta: buildPaginationMeta({ page, limit, total: result.total }),
  };
}

export async function listPending({ limit = 50 }) {
  const rows = await provenanceRepository.listPending({ limit });
  return rows.map(mapProvenance);
}

export async function getStatusBreakdown() {
  const rows = await provenanceRepository.countByStatus();

  const breakdown = {};
  for (const row of rows) {
    breakdown[row.status] = row.count;
  }

  return breakdown;
}

export function verifyProcessingHash({ signal, aiVersion, parserType, modelId, processingSteps, expectedHash }) {
  return signalHashService.verifyProcessingHash({
    signal,
    aiVersion,
    parserType,
    modelId,
    processingSteps,
    expectedHash,
  });
}

export const provenanceService = {
  createProvenance,
  getProvenance,
  getProvenanceBySignal,
  listByProvider,
  listPending,
  getStatusBreakdown,
  verifyProcessingHash,

  anchor: provenanceAnchorService.anchorProvenance,
  confirmAnchor: provenanceAnchorService.confirmAnchor,
  failAnchor: provenanceAnchorService.failAnchor,
};