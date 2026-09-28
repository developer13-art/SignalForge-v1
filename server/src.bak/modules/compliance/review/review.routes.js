/**
 * Compliance Review Routes
 *
 * Express routes for compliance review decisions. All routes require
 * authentication and reviewer privileges (enforced by parent router
 * and by the review service itself).
 *
 * @module server/modules/compliance/review/review.routes
 */

import { Router } from 'express';
import { reviewService } from './review.service';
import { asyncHandler } from '../../../lib/async-handler';
import { successResponse } from '../../../lib/response/success.response';

const router = Router();

router.get(
  '/:applicationId',
  asyncHandler(async (req, res) => {
    const reviewerId = req.user.id;
    const application = await reviewService.getApplicationForReview({
      applicationId: req.params.applicationId,
      reviewerId,
    });
    return successResponse(res, { application });
  }),
);

router.post(
  '/:applicationId/approve',
  asyncHandler(async (req, res) => {
    const reviewerId = req.user.id;
    const { notes } = req.body || {};
    const result = await reviewService.approveApplication({
      applicationId: req.params.applicationId,
      reviewerId,
      notes,
    });
    return successResponse(res, result);
  }),
);

router.post(
  '/:applicationId/reject',
  asyncHandler(async (req, res) => {
    const reviewerId = req.user.id;
    const { reason } = req.body || {};
    const result = await reviewService.rejectApplication({
      applicationId: req.params.applicationId,
      reviewerId,
      reason,
    });
    return successResponse(res, result);
  }),
);

router.post(
  '/:applicationId/resubmit',
  asyncHandler(async (req, res) => {
    const reviewerId = req.user.id;
    const { reason, specificIssues } = req.body || {};
    const result = await reviewService.requestResubmission({
      applicationId: req.params.applicationId,
      reviewerId,
      reason,
      specificIssues,
    });
    return successResponse(res, result);
  }),
);

router.post(
  '/:applicationId/suspend',
  asyncHandler(async (req, res) => {
    const reviewerId = req.user.id;
    const { reason } = req.body || {};
    const result = await reviewService.suspendApplication({
      applicationId: req.params.applicationId,
      reviewerId,
      reason,
    });
    return successResponse(res, result);
  }),
);

router.post(
  '/:applicationId/escalate',
  asyncHandler(async (req, res) => {
    const reviewerId = req.user.id;
    const { reason } = req.body || {};
    const result = await reviewService.escalateApplication({
      applicationId: req.params.applicationId,
      reviewerId,
      reason,
    });
    return successResponse(res, result);
  }),
);

export default router;