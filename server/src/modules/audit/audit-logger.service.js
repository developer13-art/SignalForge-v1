/**
 * Audit Logger Service
 *
 * Central entry point for writing audit log entries. Higher-level
 * services call this instead of the repository directly so that
 * severity-based alerting and event emission are always applied.
 *
 * @module server/modules/audit/audit-logger.service
 */

import { AppError } from '../../lib/errors/app-error';
import { ERROR_CODES } from '../../lib/errors/error-codes';
import { logger } from '../../lib/logger';
import { nowIso } from '@signalforge/shared/utils/date.util';
import { AUDIT_SEVERITIES, AUDIT_ACTOR_TYPES, isValidAction, isValidActorType, isValidSeverity } from './audit.constants';
import * as repository from './audit.repository';
import { emitAuditLogCreated, emitSecurityAlert } from './audit.events';

function enrichEntry({ entry, context }) {
  return {
    ...entry,
    ipAddress: entry.ipAddress || (context && context.ipAddress) || null,
    userAgent: entry.userAgent || (context && context.userAgent) || null,
    requestId: entry.requestId || (context && context.requestId) || null,
    correlationId: entry.correlationId || (context && context.correlationId) || null,
  };
}

export async function logAction(entry, context = {}) {
  if (!entry || !entry.action) {
    throw new AppError('action is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!isValidAction(entry.action)) {
    throw new AppError(`Invalid audit action: ${entry.action}`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (entry.actorType && !isValidActorType(entry.actorType)) {
    throw new AppError(`Invalid actor type: ${entry.actorType}`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (entry.severity && !isValidSeverity(entry.severity)) {
    throw new AppError(`Invalid severity: ${entry.severity}`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const enriched = enrichEntry({ entry, context });

  let record;
  try {
    record = await repository.insertEntry(enriched);
  } catch (err) {
    logger.error({ err, entry: enriched }, 'Failed to persist audit log entry');
    return { logged: false, error: err.message };
  }

  await emitAuditLogCreated({
    auditId: record.id,
    action: record.action,
    actorId: record.actor_id,
    actorType: record.actor_type,
    resourceType: record.resource_type,
    resourceId: record.resource_id,
    severity: record.severity,
  }).catch((err) => logger.warn({ err }, 'Failed to emit audit log created event'));

  if (record.severity === AUDIT_SEVERITIES.CRITICAL) {
    await emitSecurityAlert({
      actorId: record.actor_id,
      alertType: record.action,
      details: record.details ? JSON.parse(record.details) : null,
    }).catch((err) => logger.warn({ err }, 'Failed to emit security alert event'));
  }

  return {
    logged: true,
    auditId: record.id,
    action: record.action,
    severity: record.severity,
    createdAt: record.created_at,
  };
}

export async function logBatch(entries, context = {}) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return { logged: false, count: 0 };
  }

  const enriched = entries.map((entry) => enrichEntry({ entry, context }));

  for (const entry of enriched) {
    if (!entry.action || !isValidAction(entry.action)) {
      throw new AppError(`Invalid audit action: ${entry.action}`, ERROR_CODES.VALIDATION_FAILED, 400);
    }
  }

  const ids = await repository.insertBatch(enriched);

  logger.debug({ count: ids.length }, 'Audit log batch persisted');

  return { logged: true, count: ids.length, auditIds: ids };
}

export async function logSystemAction({ action, resourceType, resourceId, details, severity, correlationId }) {
  return logAction(
    {
      action,
      actorType: AUDIT_ACTOR_TYPES.SYSTEM,
      resourceType,
      resourceId,
      details,
      severity: severity || AUDIT_SEVERITIES.INFO,
      correlationId,
    },
    {},
  );
}

export async function logUserAction({ userId, action, resourceType, resourceId, details, severity, context }) {
  return logAction(
    {
      actorId: userId,
      actorType: AUDIT_ACTOR_TYPES.USER,
      action,
      resourceType,
      resourceId,
      details,
      severity: severity || AUDIT_SEVERITIES.INFO,
    },
    context || {},
  );
}

export async function logAdminAction({ adminId, action, resourceType, resourceId, details, reason, severity, context }) {
  return logAction(
    {
      actorId: adminId,
      actorType: AUDIT_ACTOR_TYPES.ADMIN,
      action,
      resourceType,
      resourceId,
      details: { ...(details || {}), reason: reason || null },
      severity: severity || AUDIT_SEVERITIES.NOTICE,
    },
    context || {},
  );
}

export async function logComplianceAction({ reviewerId, action, resourceType, resourceId, details, reason, context }) {
  return logAction(
    {
      actorId: reviewerId,
      actorType: AUDIT_ACTOR_TYPES.COMPLIANCE,
      action,
      resourceType,
      resourceId,
      details: { ...(details || {}), reason: reason || null },
      severity: AUDIT_SEVERITIES.NOTICE,
    },
    context || {},
  );
}

export const auditLoggerService = {
  logAction,
  logBatch,
  logSystemAction,
  logUserAction,
  logAdminAction,
  logComplianceAction,
};