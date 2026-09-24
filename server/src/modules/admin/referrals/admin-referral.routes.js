/**
 * Admin Referral Routes
 *
 * @module server/modules/admin/referrals/admin-referral.routes
 */

import { Router } from 'express';
import { adminReferralService } from './admin-referral.service';
import { asyncHandler } from '../../../lib/async-handler';
import { successResponse } from '../../../lib/response/success.response';
import { paginatedResponse } from '../../../lib/response/paginated.response';

const router = Router();

router.get(
  '/rewards',
  asyncHandler(async (req, res) => {
    const { page, limit, status, referrerId, settlementPeriod, from, to } = req.query;

    const result = await adminReferralService.listRewards({
      filters: { status, referrerId, settlementPeriod, from, to },
      pagination: { page, limit },
    });

    return paginatedResponse(res, { items: result.items, meta: result.meta });
  }),
);

router.get(
  '/rewards/status-breakdown',
  asyncHandler(async (req, res) => {
    const result = await adminReferralService.getRewardStatusBreakdown();
    return successResponse(res, result);
  }),
);

router.get(
  '/rewards/:rewardId',
  asyncHandler(async (req, res) => {
    const reward = await adminReferralService.getRewardDetails({ rewardId: req.params.rewardId });
    return successResponse(res, { reward });
  }),
);

router.post(
  '/rewards/:rewardId/approve',
  asyncHandler(async (req, res) => {
    const adminId = req.user.id;
    const result = await adminReferralService.approveReward({
      rewardId: req.params.rewardId,
      adminId,
    });
    return successResponse(res, result);
  }),
);

router.post(
  '/rewards/:rewardId/reject',
  asyncHandler(async (req, res) => {
    const adminId = req.user.id;
    const result = await adminReferralService.rejectReward({
      rewardId: req.params.rewardId,
      adminId,
      reason: req.body ? req.body.reason : null,
    });
    return successResponse(res, result);
  }),
);

router.get(
  '/relationships',
  asyncHandler(async (req, res) => {
    const { page, limit, referrerId, status } = req.query;

    const result = await adminReferralService.listRelationships({
      filters: { referrerId, status },
      pagination: { page, limit },
    });

    return paginatedResponse(res, { items: result.items, meta: result.meta });
  }),
);

export default router;