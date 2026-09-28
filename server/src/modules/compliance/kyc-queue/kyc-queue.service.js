/**
 * KYC Queue Service
 *
 * Business logic for the compliance review queue. Handles listing,
 * assignment, and release of KYC applications in review.
 *
 * @module server/modules/compliance/kyc-queue/kyc-queue.service
 */
const { AppError } = require('../../../lib/errors/app-error');
const { ERROR_CODES } = require('../../../lib/errors/error-codes');
const { logger } = require('../../../lib/logger');
const { normalizePagination, buildPaginationMeta } = require('@signalforge/shared/utils/pagination.util');
const repository = require('./kyc-queue.repository');
const { complianceService } = require('../compliance.service');
async function listQueue({ filters = {}, pagination = {} }) {
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
async function assignToReviewer({ applicationId, reviewerId, actorId }) {
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
async function releaseFromReviewer({ applicationId, actorId }) {
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
async function getQueueStats() {
  const rows = await repository.countQueueByStatus();

  const stats = {};
  for (const row of rows) {
    stats[row.status] = row.count;
  }

  return stats;
}
async function listAssignedToMe({ reviewerId, limit = 50 }) {
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
const kycQueueService = {
  listQueue,
  assignToReviewer,
  releaseFromReviewer,
  getQueueStats,
  listAssignedToMe,
};
module.exports.kycQueueService = kycQueueService;

module.exports.listQueue = listQueue;

module.exports.assignToReviewer = assignToReviewer;

module.exports.releaseFromReviewer = releaseFromReviewer;

module.exports.getQueueStats = getQueueStats;

module.exports.listAssignedToMe = listAssignedToMe;
