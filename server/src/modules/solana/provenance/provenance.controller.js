/**
 * Provenance Controller
 *
 * @module server/modules/solana/provenance/provenance.controller
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { successResponse } from '../../../lib/response/success.response';
import { paginatedResponse } from '../../../lib/response/paginated.response';
import { provenanceService } from './provenance.service';

function requireUser(req) {
  const userId = req.user && req.user.id;
  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }
  return userId;
}

function requireAdmin(req) {
  const userId = requireUser(req);
  const roles = req.user.roles || [];
  if (!roles.some((r) => ['ADMIN', 'SUPER_ADMIN'].includes(r))) {
    throw new AppError('Administrator access required', ERROR_CODES.AUTHORIZATION_FAILED, 403);
  }
  return userId;
}

export async function getProvenanceBySignal(req, res) {
  requireUser(req);

  const provenance = await provenanceService.getProvenanceBySignal({
    signalId: req.params.signalId,
  });

  return successResponse(res, { provenance });
}

export async function getProvenance(req, res) {
  requireUser(req);

  const provenance = await provenanceService.getProvenance({
    provenanceId: req.params.provenanceId,
  });

  return successResponse(res, { provenance });
}

export async function listByProvider(req, res) {
  requireUser(req);

  const { providerId } = req.params;
  const { page, limit } = req.query;

  const result = await provenanceService.listByProvider({
    providerId,
    pagination: { page, limit },
  });

  return paginatedResponse(res, { items: result.items, meta: result.meta });
}

export async function listPending(req, res) {
  requireAdmin(req);

  const provenance = await provenanceService.listPending({
    limit: req.query.limit ? Number(req.query.limit) : 50,
  });

  return successResponse(res, { provenance });
}

export async function getStatusBreakdown(req, res) {
  requireAdmin(req);

  const breakdown = await provenanceService.getStatusBreakdown();

  return successResponse(res, { breakdown });
}

export async function confirmAnchor(req, res) {
  requireAdmin(req);

  const { txSignature, slot, blockTime } = req.body || {};

  const result = await provenanceService.confirmAnchor({
    provenanceId: req.params.provenanceId,
    txSignature,
    slot,
    blockTime,
  });

  return successResponse(res, result);
}

export async function failAnchor(req, res) {
  requireAdmin(req);

  const { reason } = req.body || {};

  const result = await provenanceService.failAnchor({
    provenanceId: req.params.provenanceId,
    reason,
  });

  return successResponse(res, result);
}

export async function verifyProcessingHash(req, res) {
  requireUser(req);

  const { signal, aiVersion, parserType, modelId, processingSteps, expectedHash } = req.body || {};

  const result = provenanceService.verifyProcessingHash({
    signal,
    aiVersion,
    parserType,
    modelId,
    processingSteps,
    expectedHash,
  });

  return successResponse(res, { verification: result });
}

export const provenanceController = {
  getProvenanceBySignal,
  getProvenance,
  listByProvider,
  listPending,
  getStatusBreakdown,
  confirmAnchor,
  failAnchor,
  verifyProcessingHash,
};