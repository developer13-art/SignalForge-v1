/**
 * Admin Referral Routes
 *
 * @module server/modules/admin/referrals/admin-referral.routes
 */
const { Router } = require('express');
const { adminReferralService } = require('./admin-referral.service');
const { asyncHandler } = require('../../../lib/async-handler');
const { successResponse } = require('../../../lib/response/success.response');
const { paginatedResponse } = require('../../../lib/response/paginated.response');

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
module.exports = router;