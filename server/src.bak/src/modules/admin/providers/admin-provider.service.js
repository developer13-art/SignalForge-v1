/**
 * Admin Provider Service
 *
 * Administrative business logic for provider management.
 *
 * @module server/modules/admin/providers/admin-provider.service
 */
const { AppError } = require('../../../lib/errors/app-error');
const { ERROR_CODES } = require('../../../lib/errors/error-codes');
const { logger } = require('../../../lib/logger');
const { normalizePagination, buildPaginationMeta } = require('@signalforge/shared/utils/pagination.util');
const repository = require('./admin-provider.repository');
const { adminService } = require('../admin.service');

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
const adminProviderService = {
  listProviders,
  getProviderDetails,
  approveProvider,
  suspendProvider,
  certifyProvider,
  getStatusBreakdown,
};
module.exports.adminProviderService = adminProviderService;
