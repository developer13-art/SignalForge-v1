/**
 * Audit Service
 *
 * Top-level orchestration for audit operations. Combines the write-
 * side logger service and the read-side query service.
 *
 * @module server/modules/audit/audit.service
 */

import { auditLoggerService } from './audit-logger.service';
import { auditQueryService } from './audit-query.service';
import { auditRepository } from './audit.repository';

export async function purgeOlderThan({ retentionDays = 365 }) {
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString();

  const deleted = await auditRepository.deleteOlderThan({ cutoff });

  return { deletedCount: deleted, cutoff };
}

export const auditService = {
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