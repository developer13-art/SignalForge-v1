/**
 * Admin Provider Service
 *
 * Administrative business logic for provider management.
 *
 * @module server/modules/admin/providers/admin-provider.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { normalizePagination, buildPaginationMeta } from '@signalforge/shared/utils/pagination.util';
import * as repository from './admin-provider.repository';
import { adminService } from '../admin.service';

export async function listProviders({ filters = {}, pagination = {} }) {
  const { page, limit, offset } = normalizePagination(pagination);

  const result = await repository.listProviders({
    filters,
    pagination: { limit, offset },
  });

  return {
    items: result.items.map((row) => ({
      providerId: row.id,
      userId: row.user_id,
      userEmail: row.user_email,
      displayName: row.display_name,
      status: row.status,
      certificationStatus: row.certification_status,
      revenueSharePercent: row.revenue_share_percent,
      subscriberCount: row.subscriber_count,
      createdAt: row.created_at,
    })),
    meta: buildPaginationMeta({ page, limit, total: result.total }),
  };
}

export async function getProviderDetails({ providerId }) {
  if (!providerId) {
    throw new AppError('providerId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const provider = await repository.findProviderById({ providerId });

  if (!provider) {
    throw new AppError('Provider not found', ERROR_CODES.NOT_FOUND, 404);
  }

  return provider;
}

export async function approveProvider({ providerId, adminId }) {
  if (!providerId || !adminId) {
    throw new AppError('providerId and adminId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const provider = await repository.findProviderById({ providerId });

  if (!provider) {
    throw new AppError('Provider not found', ERROR_CODES.NOT_FOUND, 404);
  }

  await repository.updateProviderStatus({ providerId, status: 'ACTIVE' });

  await adminService.recordAdminAction({
    adminId,
    action: 'PROVIDER_APPROVE',
    targetType: 'PROVIDER',
    targetId: providerId,
    details: null,
  });

  logger.info({ providerId, adminId }, 'Provider approved');

  return { approved: true };
}

export async function suspendProvider({ providerId, adminId, reason }) {
  if (!providerId || !adminId) {
    throw new AppError('providerId and adminId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  await repository.updateProviderStatus({ providerId, status: 'SUSPENDED' });

  await adminService.recordAdminAction({
    adminId,
    action: 'PROVIDER_SUSPEND',
    targetType: 'PROVIDER',
    targetId: providerId,
    details: { reason },
  });

  logger.info({ providerId, adminId, reason }, 'Provider suspended');

  return { suspended: true };
}

export async function certifyProvider({ providerId, adminId, status }) {
  if (!providerId || !adminId) {
    throw new AppError('providerId and adminId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const validStatuses = ['CERTIFIED', 'CONDITIONALLY_CERTIFIED', 'FAILED', 'EXPIRED', 'SUSPENDED'];
  if (!validStatuses.includes(status)) {
    throw new AppError(`Invalid certification status: ${status}`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  await repository.updateCertificationStatus({ providerId, status });

  await adminService.recordAdminAction({
    adminId,
    action: 'PROVIDER_CERTIFY',
    targetType: 'PROVIDER',
    targetId: providerId,
    details: { status },
  });

  logger.info({ providerId, adminId, status }, 'Provider certification updated');

  return { certified: true, status };
}

export async function getStatusBreakdown() {
  const rows = await repository.countProvidersByStatus();

  const breakdown = {};
  for (const row of rows) {
    breakdown[row.status] = row.count;
  }

  return breakdown;
}

export const adminProviderService = {
  listProviders,
  getProviderDetails,
  approveProvider,
  suspendProvider,
  certifyProvider,
  getStatusBreakdown,
};