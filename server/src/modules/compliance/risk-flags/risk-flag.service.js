/**
 * Risk Flag Service
 *
 * Business logic for compliance risk flags attached to KYC
 * applications. Flags are created by automated checks and by manual
 * reviewer action.
 *
 * @module server/modules/compliance/risk-flags/risk-flag.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { normalizePagination, buildPaginationMeta } from '@signalforge/shared/utils/pagination.util';
import {
  RISK_FLAG_TYPE_VALUES,
  RISK_FLAG_SEVERITY_VALUES,
} from '../compliance.constants';
import * as repository from './risk-flag.repository';

export async function createRiskFlag({
  applicationId,
  userId,
  flagType,
  severity,
  details,
  createdBy,
}) {
  if (!applicationId || !flagType || !severity) {
    throw new AppError(
      'applicationId, flagType, and severity are required',
      ERROR_CODES.VALIDATION_FAILED,
      400,
    );
  }

  if (!RISK_FLAG_TYPE_VALUES.includes(flagType)) {
    throw new AppError(`Invalid flagType: ${flagType}`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!RISK_FLAG_SEVERITY_VALUES.includes(severity)) {
    throw new AppError(`Invalid severity: ${severity}`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const record = await repository.insertRiskFlag({
    applicationId,
    userId,
    flagType,
    severity,
    details,
    createdBy,
  });

  logger.info({ flagId: record.id, applicationId, flagType, severity }, 'Risk flag created');

  return {
    flagId: record.id,
    applicationId: record.application_id,
    userId: record.user_id,
    flagType: record.flag_type,
    severity: record.severity,
    details: record.details ? JSON.parse(record.details) : null,
    createdAt: record.created_at,
  };
}

export async function getFlagById({ flagId }) {
  if (!flagId) {
    throw new AppError('flagId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const record = await repository.findById({ flagId });

  if (!record) {
    throw new AppError('Risk flag not found', ERROR_CODES.NOT_FOUND, 404);
  }

  return {
    flagId: record.id,
    applicationId: record.application_id,
    userId: record.user_id,
    flagType: record.flag_type,
    severity: record.severity,
    details: record.details ? JSON.parse(record.details) : null,
    resolvedAt: record.resolved_at,
    resolvedBy: record.resolved_by,
    resolutionNotes: record.resolution_notes,
    createdAt: record.created_at,
  };
}

export async function listFlagsForApplication({ applicationId }) {
  if (!applicationId) {
    throw new AppError('applicationId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const rows = await repository.listByApplication({ applicationId });

  return rows.map((row) => ({
    flagId: row.id,
    flagType: row.flag_type,
    severity: row.severity,
    details: row.details ? JSON.parse(row.details) : null,
    resolvedAt: row.resolved_at,
    createdAt: row.created_at,
  }));
}

export async function listOpenFlags({ filters = {}, pagination = {} }) {
  const { page, limit, offset } = normalizePagination(pagination);

  const result = await repository.listOpen({
    filters,
    pagination: { limit, offset },
  });

  return {
    items: result.items.map((row) => ({
      flagId: row.id,
      applicationId: row.application_id,
      userId: row.user_id,
      flagType: row.flag_type,
      severity: row.severity,
      details: row.details ? JSON.parse(row.details) : null,
      createdAt: row.created_at,
    })),
    meta: buildPaginationMeta({ page, limit, total: result.total }),
  };
}

export async function resolveFlag({ flagId, resolvedBy, resolutionNotes }) {
  if (!flagId || !resolvedBy) {
    throw new AppError('flagId and resolvedBy are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const resolved = await repository.resolveFlag({ flagId, resolvedBy, resolutionNotes });

  if (!resolved) {
    throw new AppError('Risk flag not found or already resolved', ERROR_CODES.NOT_FOUND, 404);
  }

  logger.info({ flagId, resolvedBy }, 'Risk flag resolved');

  return { resolved: true };
}

export async function getSeverityBreakdown() {
  const rows = await repository.countBySeverity();

  const breakdown = {};
  for (const row of rows) {
    breakdown[row.severity] = row.count;
  }

  return breakdown;
}

export const riskFlagService = {
  createRiskFlag,
  getFlagById,
  listFlagsForApplication,
  listOpenFlags,
  resolveFlag,
  getSeverityBreakdown,
};