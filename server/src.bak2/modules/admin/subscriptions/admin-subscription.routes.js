/**
 * Admin Subscription Routes
 *
 * @module server/modules/admin/subscriptions/admin-subscription.routes
 */
const { Router } = require('express');
const { adminSubscriptionService } = require('./admin-subscription.service');
const { asyncHandler } = require('../../../lib/async-handler');
const { successResponse } = require('../../../lib/response/success.response');
const { paginatedResponse } = require('../../../lib/response/paginated.response');

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { page, limit, status, userId, planCode, from, to } = req.query;

    const result = await adminSubscriptionService.listSubscriptions({
      filters: { status, userId, planCode, from, to },
      pagination: { page, limit },
    });

    return paginatedResponse(res, { items: result.items, meta: result.meta });
  }),
);

router.get(
  '/status-breakdown',
  asyncHandler(async (req, res) => {
    const breakdown = await adminSubscriptionService.getStatusBreakdown();
    return successResponse(res, { breakdown });
  }),
);

router.get(
  '/:subscriptionId',
  asyncHandler(async (req, res) => {
    const subscription = await adminSubscriptionService.getSubscriptionDetails({
      subscriptionId: req.params.subscriptionId,
    });
    return successResponse(res, { subscription });
  }),
);

router.post(
  '/:subscriptionId/cancel',
  asyncHandler(async (req, res) => {
    const adminId = req.user.id;
    const result = await adminSubscriptionService.cancelSubscription({
      subscriptionId: req.params.subscriptionId,
      adminId,
      reason: req.body ? req.body.reason : null,
    });
    return successResponse(res, result);
  }),
);

router.post(
  '/:subscriptionId/extend',
  asyncHandler(async (req, res) => {
    const adminId = req.user.id;
    const result = await adminSubscriptionService.extendSubscription({
      subscriptionId: req.params.subscriptionId,
      adminId,
      extensionDays: req.body ? Number(req.body.extensionDays) : 0,
    });
    return successResponse(res, result);
  }),
);

router.post(
  '/:subscriptionId/reactivate',
  asyncHandler(async (req, res) => {
    const adminId = req.user.id;
    const result = await adminSubscriptionService.reactivateSubscription({
      subscriptionId: req.params.subscriptionId,
      adminId,
    });
    return successResponse(res, result);
  }),
);
module.exports = router;