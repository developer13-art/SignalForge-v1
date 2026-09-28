/**
 * Audit Service
 *
 * Top-level orchestration for audit operations. Combines the write-
 * side logger service and the read-side query service.
 *
 * @module server/modules/audit/audit.service
 */
const { auditLoggerService } = require('./audit-logger.service');
const { auditQueryService } = require('./audit-query.service');
const { auditRepository } = require('./audit.repository');

export async function purgeOlderThan({ retentionDays = 365 }) {
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString();

  const deleted = await auditRepository.deleteOlderThan({ cutoff });

  return { deletedCount: deleted, cutoff };
}
const auditService = {
  log: auditLoggerService.logAction,
  logBatch: auditLoggerService.logBatch,
  logSystem: auditLoggerService.logSystemAction,
  logUser: auditLoggerService.logUserAction,
  logAdmin: auditLoggerService.logAdminAction,
  logCompliance: auditLoggerService.logComplianceAction,

  list: auditQueryService.listEntries,
  get: auditQueryService.getEntry,
  listByResource: auditQueryService.listByResource,
  listByCorrelation: auditQueryService.listByCorrelation,
  getActionSummary: auditQueryService.getActionSummary,
  getSeveritySummary: auditQueryService.getSeveritySummary,
  getActorActivitySummary: auditQueryService.getActorActivitySummary,
  getRecentHighSeverity: auditQueryService.getRecentHighSeverityEntries,

  purgeOlderThan,
};
module.exports.auditService = auditService;
