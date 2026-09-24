/**
 * Admin KYC Service
 *
 * @module server/modules/admin/kyc/admin-kyc.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { normalizePagination, buildPaginationMeta } from '@signalforge/shared/utils/pagination.util';
import * as repository from './admin-kyc.repository';

export async function listKycApplications({ filters = {}, pagination = {} }) {
  const { page, limit, offset } = normalizePagination(pagination);

  const result = await repository.listKycApplications({
    filters,
    pagination: { limit, offset },
  });

  return {
    items: result.items.map((row) => ({
      applicationId: row.id,
      userId: row.user_id,
      userEmail: row.user_email,
      status: row.status,
      provider: row.provider,
      submittedAt: row.submitted_at,
      reviewedAt: row.reviewed_at,
      verifiedAt: row.verified_at,
      rejectionReason: row.rejection_reason,
    })),
    meta: buildPaginationMeta({ page, limit, total: result.total }),
  };
}

export async function getKycApplicationDetails({ applicationId }) {
  if (!applicationId) {
    throw new AppError('applicationId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const application = await repository.findKycApplicationById({ applicationId });

  if (!application) {
    throw new AppError('KYC application not found', ERROR_CODES.NOT_FOUND, 404);
  }

  return application;
}

export async function getStatusBreakdown() {
  const rows = await repository.countByStatus();

  const breakdown = {};
  for (const row of rows) {
    breakdown[row.status] = row.count;
  }

  return breakdown;
}

export const adminKycService = {
  listKycApplications,
  getKycApplicationDetails,
  getStatusBreakdown,
};