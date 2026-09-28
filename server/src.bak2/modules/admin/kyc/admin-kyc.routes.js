/**
 * Admin KYC Routes
 *
 * @module server/modules/admin/kyc/admin-kyc.routes
 */
const { Router } = require('express');
const { adminKycService } = require('./admin-kyc.service');
const { asyncHandler } = require('../../../lib/async-handler');
const { successResponse } = require('../../../lib/response/success.response');
const { paginatedResponse } = require('../../../lib/response/paginated.response');

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { page, limit, status, userId, reviewerId } = req.query;

    const result = await adminKycService.listKycApplications({
      filters: { status, userId, reviewerId },
      pagination: { page, limit },
    });

    return paginatedResponse(res, { items: result.items, meta: result.meta });
  }),
);

router.get(
  '/status-breakdown',
  asyncHandler(async (req, res) => {
    const breakdown = await adminKycService.getStatusBreakdown();
    return successResponse(res, { breakdown });
  }),
);

router.get(
  '/:applicationId',
  asyncHandler(async (req, res) => {
    const application = await adminKycService.getKycApplicationDetails({
      applicationId: req.params.applicationId,
    });
    return successResponse(res, { application });
  }),
);
module.exports = router;