/**
 * KYC Queue Service
 *
 * Business logic for the compliance review queue. Handles listing,
 * assignment, and release of KYC applications in review.
 *
 * @module server/modules/compliance/kyc-queue/kyc-queue.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { normalizePagination, buildPaginationMeta } from '@signalforge/shared/utils/pagination.util';
import * as repository from './kyc-queue.repository';
import { complianceService } from '../compliance.service';

export async function listQueue({ filters = {}, pagination = {} }) {
  const { page, limit, offset } = normalizePagination(pagination);

  const result = await repository.listQueueItems({
    filters,
    pagination: { limit, offset },
  });

  return {
    items: result.items.map((row) => ({
      applicationId: row.id,
      userId: row.user_id,
      userEmail: row.user_email,
      firstName: row.first_name,
      lastName: row.last_name,
      status: row.status,
      provider: row.provider,
      riskScore: row.risk_score,
      reviewerId: row.reviewer_id,
      slaDueAt: row.sla_due_at,
      submittedAt: row.submitted_at,
    })),
    meta: buildPaginationMeta({ page, limit, total: result.total }),
  };
}

export async function assignToReviewer({ applicationId, reviewerId, actorId }) {
  if (!applicationId || !reviewerId || !actorId) {
    throw new AppError(
      'applicationId, reviewerId, and actorId are required',
      ERROR_CODES.VALIDATION_FAILED,
      400,
    );
  }

  const updated = await repository.assignReviewer({ applicationId, reviewerId });

  if (!updated) {
    throw new AppError('KYC application not found', ERROR_CODES.NOT_FOUND, 404);
  }

  await complianceService.recordComplianceAction({
    actorId,
    action: 'KYC_ASSIGN_REVIEWER',
    resourceType: 'KYC_APPLICATION',
    resourceId: applicationId,
    newValue: { reviewerId },
  });

  logger.info({ applicationId, reviewerId, actorId }, 'KYC application assigned');

  return { assigned: true };
}

export async function releaseFromReviewer({ applicationId, actorId }) {
  if (!applicationId || !actorId) {
    throw new AppError('applicationId and actorId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const updated = await repository.releaseReviewer({ applicationId });

  if (!updated) {
    throw new AppError('KYC application not found', ERROR_CODES.NOT_FOUND, 404);
  }

  await complianceService.recordComplianceAction({
    actorId,
    action: 'KYC_RELEASE_REVIEWER',
    resourceType: 'KYC_APPLICATION',
    resourceId: applicationId,
  });

  logger.info({ applicationId, actorId }, 'KYC application released from reviewer');

  return { released: true };
}

export async function getQueueStats() {
  const rows = await repository.countQueueByStatus();

  const stats = {};
  for (const row of rows) {
    stats[row.status] = row.count;
  }

  return stats;
}

export async function listAssignedToMe({ reviewerId, limit = 50 }) {
  if (!reviewerId) {
    throw new AppError('reviewerId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const rows = await repository.findAssignedToReviewer({ reviewerId, limit });

  return rows.map((row) => ({
    applicationId: row.id,
    userId: row.user_id,
    status: row.status,
    submittedAt: row.submitted_at,
    slaDueAt: row.sla_due_at,
  }));
}

export const kycQueueService = {
  listQueue,
  assignToReviewer,
  releaseFromReviewer,
  getQueueStats,
  listAssignedToMe,
};