/**
 * Verification Controller
 *
 * @module server/modules/solana/verification/verification.controller
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { successResponse } from '../../../lib/response/success.response';
import { verificationService } from './verification.service';

export async function verifyByAttestationId(req, res) {
  const result = await verificationService.verifyByAttestationId({
    attestationId: req.params.attestationId,
  });

  return successResponse(res, result);
}

export async function verifyByHash(req, res) {
  const result = await verificationService.verifyByHash({
    attestationHash: req.params.attestationHash,
  });

  return successResponse(res, result);
}

export async function verifySignal(req, res) {
  const result = await verificationService.verifySignalBySignalId({
    signalId: req.params.signalId,
  });

  return successResponse(res, result);
}

export async function verifyByProcessingHash(req, res) {
  const result = await verificationService.verifyByProcessingHash({
    processingHash: req.params.processingHash,
  });

  return successResponse(res, result);
}

export async function auditAttestation(req, res) {
  const userId = req.user && req.user.id;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const result = await verificationService.auditAttestation({
    attestationId: req.params.attestationId,
  });

  return successResponse(res, result);
}

export async function auditProvenance(req, res) {
  const userId = req.user && req.user.id;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const result = await verificationService.auditProvenance({
    provenanceId: req.params.provenanceId,
  });

  return successResponse(res, result);
}

export async function auditPending(req, res) {
  const userId = req.user && req.user.id;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const result = await verificationService.auditPendingRecords({
    limit: req.query.limit ? Number(req.query.limit) : 50,
  });

  return successResponse(res, result);
}

export const verificationController = {
  verifyByAttestationId,
  verifyByHash,
  verifySignal,
  verifyByProcessingHash,
  auditAttestation,
  auditProvenance,
  auditPending,
};