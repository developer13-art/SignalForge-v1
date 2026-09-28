/**
 * Verification Controller
 *
 * @module server/modules/solana/verification/verification.controller
 */
const { AppError } = require('../../../lib/errors/app-error');
const { ERROR_CODES } = require('../../../lib/errors/error-codes');
const { successResponse } = require('../../../lib/response/success.response');
const { verificationService } = require('./verification.service');
async function verifyByAttestationId(req, res) {
  const result = await verificationService.verifyByAttestationId({
    attestationId: req.params.attestationId,
  });

  return successResponse(res, result);
}
async function verifyByHash(req, res) {
  const result = await verificationService.verifyByHash({
    attestationHash: req.params.attestationHash,
  });

  return successResponse(res, result);
}
async function verifySignal(req, res) {
  const result = await verificationService.verifySignalBySignalId({
    signalId: req.params.signalId,
  });

  return successResponse(res, result);
}
async function verifyByProcessingHash(req, res) {
  const result = await verificationService.verifyByProcessingHash({
    processingHash: req.params.processingHash,
  });

  return successResponse(res, result);
}
async function auditAttestation(req, res) {
  const userId = req.user && req.user.id;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const result = await verificationService.auditAttestation({
    attestationId: req.params.attestationId,
  });

  return successResponse(res, result);
}
async function auditProvenance(req, res) {
  const userId = req.user && req.user.id;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const result = await verificationService.auditProvenance({
    provenanceId: req.params.provenanceId,
  });

  return successResponse(res, result);
}
async function auditPending(req, res) {
  const userId = req.user && req.user.id;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const result = await verificationService.auditPendingRecords({
    limit: req.query.limit ? Number(req.query.limit) : 50,
  });

  return successResponse(res, result);
}
const verificationController = {
  verifyByAttestationId,
  verifyByHash,
  verifySignal,
  verifyByProcessingHash,
  auditAttestation,
  auditProvenance,
  auditPending,
};
module.exports.verificationController = verificationController;

module.exports.verifyByAttestationId = verifyByAttestationId;

module.exports.verifyByHash = verifyByHash;

module.exports.verifySignal = verifySignal;

module.exports.verifyByProcessingHash = verifyByProcessingHash;

module.exports.auditAttestation = auditAttestation;

module.exports.auditProvenance = auditProvenance;

module.exports.auditPending = auditPending;
