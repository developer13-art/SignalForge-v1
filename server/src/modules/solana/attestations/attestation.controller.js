/**
 * Attestation Controller
 *
 * @module server/modules/solana/attestations/attestation.controller
 */
const { AppError } = require('../../../lib/errors/app-error');
const { ERROR_CODES } = require('../../../lib/errors/error-codes');
const { successResponse } = require('../../../lib/response/success.response');
const { paginatedResponse } = require('../../../lib/response/paginated.response');
const { attestationService } = require('./attestation.service');
const { validateCreateAttestationPayload, validateRevokeAttestationPayload } = require('./attestation.validator');

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
async function createAttestation(req, res) {
  requireAdmin(req);

  const payload = validateCreateAttestationPayload(req.body || {});

  const attestation = await attestationService.createAttestation(payload);

  return successResponse(res, { attestation }, 201);
}
async function getAttestation(req, res) {
  requireUser(req);

  const attestation = await attestationService.getAttestation({
    attestationId: req.params.attestationId,
  });

  return successResponse(res, { attestation });
}
async function listAttestationsBySubject(req, res) {
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
async function revokeAttestation(req, res) {
  requireAdmin(req);

  const payload = validateRevokeAttestationPayload(req.body || {});

  const result = await attestationService.revokeAttestation({
    attestationId: req.params.attestationId,
    reason: payload.reason,
  });

  return successResponse(res, result);
}
async function listPending(req, res) {
  requireAdmin(req);

  const attestations = await attestationService.listPendingAttestations({
    limit: req.query.limit ? Number(req.query.limit) : 50,
  });

  return successResponse(res, { attestations });
}
async function getStatusBreakdown(req, res) {
  requireAdmin(req);

  const breakdown = await attestationService.getStatusBreakdown();

  return successResponse(res, { breakdown });
}
async function markAnchored(req, res) {
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
async function markFailed(req, res) {
  requireAdmin(req);

  const { reason } = req.body || {};

  const result = await attestationService.markAttestationFailed({
    attestationId: req.params.attestationId,
    reason,
  });

  return successResponse(res, result);
}
const attestationController = {
  createAttestation,
  getAttestation,
  listAttestationsBySubject,
  revokeAttestation,
  listPending,
  getStatusBreakdown,
  markAnchored,
  markFailed,
};
module.exports.attestationController = attestationController;

module.exports.createAttestation = createAttestation;

module.exports.getAttestation = getAttestation;

module.exports.listAttestationsBySubject = listAttestationsBySubject;

module.exports.revokeAttestation = revokeAttestation;

module.exports.listPending = listPending;

module.exports.getStatusBreakdown = getStatusBreakdown;

module.exports.markAnchored = markAnchored;

module.exports.markFailed = markFailed;
