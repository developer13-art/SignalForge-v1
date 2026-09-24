/**
 * Admin KYC Routes
 *
 * @module server/modules/admin/kyc/admin-kyc.routes
 */

import { Router } from 'express';
import { adminKycService } from './admin-kyc.service';
import { asyncHandler } from '../../../lib/async-handler';
import { successResponse } from '../../../lib/response/success.response';
import { paginatedResponse } from '../../../lib/response/paginated.response';

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

export default router;