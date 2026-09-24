/**
 * Admin Signal Monitor Service
 *
 * Administrative view of the signal pipeline: listing, filtering,
 * rejected, and duplicate signals.
 *
 * @module server/modules/admin/signals/admin-signal-monitor.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { normalizePagination, buildPaginationMeta } from '@signalforge/shared/utils/pagination.util';
import * as repository from './admin-signal.repository';

export async function listSignals({ filters = {}, pagination = {} }) {
  const { page, limit, offset } = normalizePagination(pagination);

  const result = await repository.listSignals({
    filters,
    pagination: { limit, offset },
  });

  return {
    items: result.items.map((row) => ({
      signalId: row.id,
      providerId: row.provider_id,
      providerName: row.provider_name,
      symbol: row.symbol,
      direction: row.direction,
      confidence: row.confidence,
      classification: row.classification,
      status: row.status,
      createdAt: row.created_at,
    })),
    meta: buildPaginationMeta({ page, limit, total: result.total }),
  };
}

export async function getSignalDetails({ signalId }) {
  if (!signalId) {
    throw new AppError('signalId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const signal = await repository.findSignalById({ signalId });

  if (!signal) {
    throw new AppError('Signal not found', ERROR_CODES.NOT_FOUND, 404);
  }

  return signal;
}

export async function listRejectedSignals({ limit = 50 }) {
  const rows = await repository.listRejectedSignals({ limit });

  return rows.map((row) => ({
    signalId: row.id,
    providerId: row.provider_id,
    symbol: row.symbol,
    direction: row.direction,
    status: row.status,
    rejectionReason: row.rejection_reason,
    createdAt: row.created_at,
  }));
}

export async function listDuplicateSignals({ limit = 50 }) {
  const rows = await repository.listDuplicateSignals({ limit });

  return rows.map((row) => ({
    signalId: row.id,
    providerId: row.provider_id,
    symbol: row.symbol,
    direction: row.direction,
    status: row.status,
    fingerprint: row.fingerprint,
    createdAt: row.created_at,
  }));
}

export async function getStatusBreakdown({ since }) {
  const rows = await repository.countByStatus({ since });

  const breakdown = {};
  for (const row of rows) {
    breakdown[row.status] = row.count;
  }

  return breakdown;
}

export const adminSignalMonitorService = {
  listSignals,
  getSignalDetails,
  listRejectedSignals,
  listDuplicateSignals,
  getStatusBreakdown,
};