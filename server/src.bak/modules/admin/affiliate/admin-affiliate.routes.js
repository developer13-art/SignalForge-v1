/**
 * Admin Affiliate Routes
 *
 * @module server/modules/admin/affiliate/admin-affiliate.routes
 */

import { Router } from 'express';
import { adminAffiliateService } from './admin-affiliate.service';
import { asyncHandler } from '../../../lib/async-handler';
import { successResponse } from '../../../lib/response/success.response';
import { paginatedResponse } from '../../../lib/response/paginated.response';

const router = Router();

router.get(
  '/partners',
  asyncHandler(async (req, res) => {
    const { page, limit, status, tier } = req.query;

    const result = await adminAffiliateService.listPartners({
      filters: { status, tier },
      pagination: { page, limit },
    });

    return paginatedResponse(res, { items: result.items, meta: result.meta });
  }),
);

router.get(
  '/partners/status-breakdown',
  asyncHandler(async (req, res) => {
    const breakdown = await adminAffiliateService.getPartnerStatusBreakdown();
    return successResponse(res, { breakdown });
  }),
);

router.get(
  '/partners/:partnerId',
  asyncHandler(async (req, res) => {
    const partner = await adminAffiliateService.getPartnerDetails({ partnerId: req.params.partnerId });
    return successResponse(res, { partner });
  }),
);

router.post(
  '/partners/:partnerId/suspend',
  asyncHandler(async (req, res) => {
    const adminId = req.user.id;
    const result = await adminAffiliateService.suspendPartner({
      partnerId: req.params.partnerId,
      adminId,
      reason: req.body ? req.body.reason : null,
    });
    return successResponse(res, result);
  }),
);

router.post(
  '/partners/:partnerId/activate',
  asyncHandler(async (req, res) => {
    const adminId = req.user.id;
    const result = await adminAffiliateService.activatePartner({
      partnerId: req.params.partnerId,
      adminId,
    });
    return successResponse(res, result);
  }),
);

router.post(
  '/partners/:partnerId/tier',
  asyncHandler(async (req, res) => {
    const adminId = req.user.id;
    const result = await adminAffiliateService.updatePartnerTier({
      partnerId: req.params.partnerId,
      adminId,
      tier: req.body ? req.body.tier : null,
    });
    return successResponse(res, result);
  }),
);

router.get(
  '/commissions',
  asyncHandler(async (req, res) => {
    const { page, limit, status, partnerUserId } = req.query;

    const result = await adminAffiliateService.listCommissions({
      filters: { status, partnerUserId },
      pagination: { page, limit },
    });

    return paginatedResponse(res, { items: result.items, meta: result.meta });
  }),
);

export default router;