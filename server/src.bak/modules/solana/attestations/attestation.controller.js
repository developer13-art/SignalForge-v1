/**
 * Attestation Controller
 *
 * @module server/modules/solana/attestations/attestation.controller
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { successResponse } from '../../../lib/response/success.response';
import { paginatedResponse } from '../../../lib/response/paginated.response';
import { attestationService } from './attestation.service';
import { validateCreateAttestationPayload, validateRevokeAttestationPayload } from './attestation.validator';

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

export async function createAttestation(req, res) {
  requireAdmin(req);

  const payload = validateCreateAttestationPayload(req.body || {});

  const attestation = await attestationService.createAttestation(payload);

  return successResponse(res, { attestation }, 201);
}

export async function getAttestation(req, res) {
  requireUser(req);

  const attestation = await attestationService.getAttestation({
    attestationId: req.params.attestationId,
  });

  return successResponse(res, { attestation });
}

export async function listAttestationsBySubject(req, res) {
  requireUser(req);

  const { subjectType, subjectId } = req.params;
  const { page, limit } = req.query;

  const result = await attestationService.listBySubject({
    subjectType,
    subjectId,
    pagination: { page, limit },
  });

  return paginatedResponse(res, { items: result.items, meta: result.meta });
}

export async function revokeAttestation(req, res) {
  requireAdmin(req);

  const payload = validateRevokeAttestationPayload(req.body || {});

  const result = await attestationService.revokeAttestation({
    attestationId: req.params.attestationId,
    reason: payload.reason,
  });

  return successResponse(res, result);
}

export async function listPending(req, res) {
  requireAdmin(req);

  const attestations = await attestationService.listPendingAttestations({
    limit: req.query.limit ? Number(req.query.limit) : 50,
  });

  return successResponse(res, { attestations });
}

export async function getStatusBreakdown(req, res) {
  requireAdmin(req);

  const breakdown = await attestationService.getStatusBreakdown();

  return successResponse(res, { breakdown });
}

export async function markAnchored(req, res) {
  requireAdmin(req);

  const { txSignature, slot, blockTime } = req.body || {};

  const result = await attestationService.markAttestationAnchored({
    attestationId: req.params.attestationId,
    txSignature,
    slot,
    blockTime,
  });

  return successResponse(res, result);
}

export async function markFailed(req, res) {
  requireAdmin(req);

  const { reason } = req.body || {};

  const result = await attestationService.markAttestationFailed({
    attestationId: req.params.attestationId,
    reason,
  });

  return successResponse(res, result);
}

export const attestationController = {
  createAttestation,
  getAttestation,
  listAttestationsBySubject,
  revokeAttestation,
  listPending,
  getStatusBreakdown,
  markAnchored,
  markFailed,
};