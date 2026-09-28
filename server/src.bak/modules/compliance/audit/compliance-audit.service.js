/**
 * Compliance Audit Service
 *
 * Business logic for the immutable compliance audit log. Every
 * reviewer decision and administrative action on KYC data is recorded
 * here.
 *
 * @module server/modules/compliance/audit/compliance-audit.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { normalizePagination, buildPaginationMeta } from '@signalforge/shared/utils/pagination.util';
import * as repository from './compliance-audit.repository';

export async function recordEntry({
  actorId,
  action,
  resourceType,
  resourceId,
  previousState,
  newState,
  reason,
  ipAddress,
  userAgent,
}) {
  if (!actorId || !action) {
    throw new AppError('actorId and action are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const record = await repository.insertAuditEntry({
    actorId,
    action,
    resourceType,
    resourceId,
    previousState,
    newState,
    reason,
    ipAddress,
    userAgent,
  });

  logger.debug({ auditId: record.id, actorId, action }, 'Compliance audit entry recorded');

  return {
    auditId: record.id,
    actorId: record.actor_id,
    action: record.action,
    resourceType: record.resource_type,
    resourceId: record.resource_id,
    createdAt: record.created_at,
  };
}

export async function listEntries({ filters = {}, pagination = {} }) {
  const { page, limit, offset } = normalizePagination(pagination);

  const result = await repository.listEntries({
    filters,
    pagination: { limit, offset },
  });

  return {
    items: result.items.map((row) => ({
      auditId: row.id,
      actorId: row.actor_id,
      action: row.action,
      resourceType: row.resource_type,
      resourceId: row.resource_id,
      previousState: row.previous_state ? JSON.parse(row.previous_state) : null,
      newState: row.new_state ? JSON.parse(row.new_state) : null,
      reason: row.reason,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      createdAt: row.created_at,
    })),
    meta: buildPaginationMeta({ page, limit, total: result.total }),
  };
}

export async function listByResource({ resourceType, resourceId }) {
  if (!resourceType || !resourceId) {
    throw new AppError('resourceType and resourceId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const rows = await repository.findByResource({ resourceType, resourceId });

  return rows.map((row) => ({
    auditId: row.id,
    actorId: row.actor_id,
    action: row.action,
    previousState: row.previous_state ? JSON.parse(row.previous_state) : null,
    newState: row.new_state ? JSON.parse(row.new_state) : null,
    reason: row.reason,
    createdAt: row.created_at,
  }));
}

export async function getActorSummary({ actorId, since }) {
  if (!actorId) {
    throw new AppError('actorId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const rows = await repository.countActionsByActor({ actorId, since });

  const summary = {};
  for (const row of rows) {
    summary[row.action] = row.count;
  }

  return summary;
}

export const complianceAuditService = {
  recordEntry,
  listEntries,
  listByResource,
  getActorSummary,
};