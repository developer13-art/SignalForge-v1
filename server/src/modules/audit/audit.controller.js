/**
 * Audit Controller
 *
 * HTTP handlers for audit log operations.
 *
 * @module server/modules/audit/audit.controller
 */
const { AppError } = require('../../lib/errors/app-error');
const { ERROR_CODES } = require('../../lib/errors/error-codes');
const { successResponse } = require('../../lib/response/success.response');
const { paginatedResponse } = require('../../lib/response/paginated.response');
const { auditService } = require('./audit.service');

function requireAdmin(req) {
  const userId = req.user && req.user.id;
  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }
  return userId;
}
async function listAuditEntries(req, res) {
  requireAdmin(req);

  const {
    page,
    limit,
    actorId,
    actorType,
    action,
    resourceType,
    resourceId,
    severity,
    correlationId,
    from,
    to,
  } = req.query;

  const result = await auditService.list({
    filters: {
      actorId,
      actorType,
      action,
      resourceType,
      resourceId,
      severity,
      correlationId,
      from,
      to,
    },
    pagination: { page, limit },
  });

  return paginatedResponse(res, {
    items: result.items,
    meta: result.meta,
  });
}
async function getAuditEntry(req, res) {
  requireAdmin(req);

  const entry = await auditService.get({ auditId: req.params.auditId });

  return successResponse(res, { entry });
}
async function listByResource(req, res) {
  requireAdmin(req);

  const { resourceType, resourceId } = req.params;
  const { limit } = req.query;

  const entries = await auditService.listByResource({
    resourceType,
    resourceId,
    limit: limit ? Number(limit) : 200,
  });

  return successResponse(res, { entries });
}
async function listByCorrelation(req, res) {
  requireAdmin(req);

  const { correlationId } = req.params;
  const { limit } = req.query;

  const entries = await auditService.listByCorrelation({
    correlationId,
    limit: limit ? Number(limit) : 500,
  });

  return successResponse(res, { entries });
}
async function getActionSummary(req, res) {
  requireAdmin(req);

  const summary = await auditService.getActionSummary({
    from: req.query.from,
    to: req.query.to,
  });

  return successResponse(res, { summary });
}
async function getSeveritySummary(req, res) {
  requireAdmin(req);

  const summary = await auditService.getSeveritySummary({
    from: req.query.from,
    to: req.query.to,
  });

  return successResponse(res, { summary });
}
async function getActorActivity(req, res) {
  requireAdmin(req);

  const summary = await auditService.getActorActivitySummary({
    actorId: req.params.actorId,
    from: req.query.from,
    to: req.query.to,
  });

  return successResponse(res, { summary });
}
async function getRecentHighSeverity(req, res) {
  requireAdmin(req);

  const { limit } = req.query;

  const entries = await auditService.getRecentHighSeverity({
    limit: limit ? Number(limit) : 50,
  });

  return successResponse(res, { entries });
}
const auditController = {
  listAuditEntries,
  getAuditEntry,
  listByResource,
  listByCorrelation,
  getActionSummary,
  getSeveritySummary,
  getActorActivity,
  getRecentHighSeverity,
};
module.exports.auditController = auditController;

module.exports.listAuditEntries = listAuditEntries;

module.exports.getAuditEntry = getAuditEntry;

module.exports.listByResource = listByResource;

module.exports.listByCorrelation = listByCorrelation;

module.exports.getActionSummary = getActionSummary;

module.exports.getSeveritySummary = getSeveritySummary;

module.exports.getActorActivity = getActorActivity;

module.exports.getRecentHighSeverity = getRecentHighSeverity;
