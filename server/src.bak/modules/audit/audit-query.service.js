/**
 * Audit Query Service
 *
 * Read-side of the audit module. Provides filtered listing, per-
 * resource timelines, per-correlation timelines, and aggregate
 * summaries.
 *
 * @module server/modules/audit/audit-query.service
 */

import { AppError } from '../../lib/errors/app-error';
import { ERROR_CODES } from '../../lib/errors/error-codes';
import { normalizePagination, buildPaginationMeta } from '@signalforge/shared/utils/pagination.util';
import * as repository from './audit.repository';

function normalizeEntry(row) {
  return {
    auditId: row.id,
    actorId: row.actor_id,
    actorType: row.actor_type,
    action: row.action,
    resourceType: row.resource_type,
    resourceId: row.resource_id,
    severity: row.severity,
    details: row.details ? (typeof row.details === 'string' ? JSON.parse(row.details) : row.details) : null,
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
    requestId: row.request_id,
    correlationId: row.correlation_id,
    createdAt: row.created_at,
  };
}

export async function listEntries({ filters = {}, pagination = {} }) {
  const { page, limit, offset } = normalizePagination(pagination);

  const result = await repository.list({
    filters,
    pagination: { limit, offset },
  });

  return {
    items: result.items.map(normalizeEntry),
    meta: buildPaginationMeta({ page, limit, total: result.total }),
  };
}

export async function getEntry({ auditId }) {
  if (!auditId) {
    throw new AppError('auditId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const row = await repository.findById({ auditId });

  if (!row) {
    throw new AppError('Audit entry not found', ERROR_CODES.NOT_FOUND, 404);
  }

  return normalizeEntry(row);
}

export async function listByResource({ resourceType, resourceId, limit = 200 }) {
  if (!resourceType || !resourceId) {
    throw new AppError('resourceType and resourceId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const rows = await repository.listByResource({ resourceType, resourceId, limit });

  return rows.map(normalizeEntry);
}

export async function listByCorrelation({ correlationId, limit = 500 }) {
  if (!correlationId) {
    throw new AppError('correlationId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const rows = await repository.listByCorrelation({ correlationId, limit });

  return rows.map(normalizeEntry);
}

export async function getActionSummary({ from, to }) {
  const rows = await repository.countByAction({ filters: { from, to } });

  const summary = {};
  let total = 0;
  for (const row of rows) {
    summary[row.action] = row.count;
    total += row.count;
  }

  return { total, actions: summary };
}

export async function getSeveritySummary({ from, to }) {
  const rows = await repository.countBySeverity({ filters: { from, to } });

  const summary = {};
  let total = 0;
  for (const row of rows) {
    summary[row.severity] = row.count;
    total += row.count;
  }

  return { total, severities: summary };
}

export async function getActorActivitySummary({ actorId, from, to }) {
  if (!actorId) {
    throw new AppError('actorId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { items } = await repository.list({
    filters: { actorId, from, to },
    pagination: { limit: 500, offset: 0 },
  });

  const byAction = {};
  const byResource = {};

  for (const row of items) {
    byAction[row.action] = (byAction[row.action] || 0) + 1;
    const key = row.resource_type || 'UNKNOWN';
    byResource[key] = (byResource[key] || 0) + 1;
  }

  return {
    actorId,
    totalActions: items.length,
    byAction,
    byResource,
  };
}

export async function getRecentHighSeverityEntries({ limit = 50 }) {
  const { items } = await repository.list({
    filters: {},
    pagination: { limit, offset: 0 },
  });

  return items
    .filter((row) => row.severity === 'CRITICAL' || row.severity === 'WARNING')
    .map(normalizeEntry);
}

export const auditQueryService = {
  listEntries,
  getEntry,
  listByResource,
  listByCorrelation,
  getActionSummary,
  getSeveritySummary,
  getActorActivitySummary,
  getRecentHighSeverityEntries,
};