/**
 * KYC Queue Routes
 *
 * @module server/modules/compliance/kyc-queue/kyc-queue.routes
 */

import { Router } from 'express';
import { kycQueueService } from './kyc-queue.service';
import { asyncHandler } from '../../../lib/async-handler';
import { successResponse } from '../../../lib/response/success.response';
import { paginatedResponse } from '../../../lib/response/paginated.response';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { page, limit, status, assignedReviewerId, unassignedOnly, minRiskScore } = req.query;

    const result = await kycQueueService.listQueue({
      filters: {
        status,
        assignedReviewerId,
        unassignedOnly: unassignedOnly === 'true',
        minRiskScore: minRiskScore !== undefined ? Number(minRiskScore) : undefined,
      },
      pagination: { page, limit },
    });

    return paginatedResponse(res, { items: result.items, meta: result.meta });
  }),
);

router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const stats = await kycQueueService.getQueueStats();
    return successResponse(res, { stats });
  }),
);

router.get(
  '/assigned-to-me',
  asyncHandler(async (req, res) => {
    const reviewerId = req.user.id;
    const applications = await kycQueueService.listAssignedToMe({
      reviewerId,
      limit: req.query.limit ? Number(req.query.limit) : 50,
    });
    return successResponse(res, { applications });
  }),
);

router.post(
  '/:applicationId/assign',
  asyncHandler(async (req, res) => {
    const actorId = req.user.id;
    const result = await kycQueueService.assignToReviewer({
      applicationId: req.params.applicationId,
      reviewerId: req.body ? req.body.reviewerId : actorId,
      actorId,
    });
    return successResponse(res, result);
  }),
);

router.post(
  '/:applicationId/release',
  asyncHandler(async (req, res) => {
    const actorId = req.user.id;
    const result = await kycQueueService.releaseFromReviewer({
      applicationId: req.params.applicationId,
      actorId,
    });
    return successResponse(res, result);
  }),
);

export default router;