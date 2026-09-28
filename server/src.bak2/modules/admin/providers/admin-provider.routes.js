/**
 * Admin Provider Routes
 *
 * @module server/modules/admin/providers/admin-provider.routes
 */
const { Router } = require('express');
const { adminProviderService } = require('./admin-provider.service');
const { asyncHandler } = require('../../../lib/async-handler');
const { successResponse } = require('../../../lib/response/success.response');
const { paginatedResponse } = require('../../../lib/response/paginated.response');

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { page, limit, status, certificationStatus, search } = req.query;

    const result = await adminProviderService.listProviders({
      filters: { status, certificationStatus, search },
      pagination: { page, limit },
    });

    return paginatedResponse(res, { items: result.items, meta: result.meta });
  }),
);

router.get(
  '/status-breakdown',
  asyncHandler(async (req, res) => {
    const breakdown = await adminProviderService.getStatusBreakdown();
    return successResponse(res, { breakdown });
  }),
);

router.get(
  '/:providerId',
  asyncHandler(async (req, res) => {
    const provider = await adminProviderService.getProviderDetails({ providerId: req.params.providerId });
    return successResponse(res, { provider });
  }),
);

router.post(
  '/:providerId/approve',
  asyncHandler(async (req, res) => {
    const adminId = req.user.id;
    const result = await adminProviderService.approveProvider({
      providerId: req.params.providerId,
      adminId,
    });
    return successResponse(res, result);
  }),
);

router.post(
  '/:providerId/suspend',
  asyncHandler(async (req, res) => {
    const adminId = req.user.id;
    const result = await adminProviderService.suspendProvider({
      providerId: req.params.providerId,
      adminId,
      reason: req.body ? req.body.reason : null,
    });
    return successResponse(res, result);
  }),
);

router.post(
  '/:providerId/certify',
  asyncHandler(async (req, res) => {
    const adminId = req.user.id;
    const result = await adminProviderService.certifyProvider({
      providerId: req.params.providerId,
      adminId,
      status: req.body ? req.body.status : null,
    });
    return successResponse(res, result);
  }),
);
module.exports = router;