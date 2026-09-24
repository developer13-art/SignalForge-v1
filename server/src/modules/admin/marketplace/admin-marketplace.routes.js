/**
 * Admin Marketplace Routes
 *
 * @module server/modules/admin/marketplace/admin-marketplace.routes
 */

import { Router } from 'express';
import { adminMarketplaceService } from './admin-marketplace.service';
import { asyncHandler } from '../../../lib/async-handler';
import { successResponse } from '../../../lib/response/success.response';
import { paginatedResponse } from '../../../lib/response/paginated.response';

const router = Router();

router.get(
  '/listings',
  asyncHandler(async (req, res) => {
    const { page, limit, status, providerId } = req.query;

    const result = await adminMarketplaceService.listListings({
      filters: { status, providerId },
      pagination: { page, limit },
    });

    return paginatedResponse(res, { items: result.items, meta: result.meta });
  }),
);

router.post(
  '/listings/:listingId/suspend',
  asyncHandler(async (req, res) => {
    const adminId = req.user.id;
    const result = await adminMarketplaceService.suspendListing({
      listingId: req.params.listingId,
      adminId,
      reason: req.body ? req.body.reason : null,
    });
    return successResponse(res, result);
  }),
);

router.delete(
  '/listings/:listingId',
  asyncHandler(async (req, res) => {
    const adminId = req.user.id;
    const result = await adminMarketplaceService.removeListing({
      listingId: req.params.listingId,
      adminId,
      reason: req.body ? req.body.reason : null,
    });
    return successResponse(res, result);
  }),
);

router.get(
  '/reviews',
  asyncHandler(async (req, res) => {
    const { page, limit, listingId, status } = req.query;

    const result = await adminMarketplaceService.listReviews({
      filters: { listingId, status },
      pagination: { page, limit },
    });

    return paginatedResponse(res, { items: result.items, meta: result.meta });
  }),
);

router.post(
  '/reviews/:reviewId/approve',
  asyncHandler(async (req, res) => {
    const adminId = req.user.id;
    const result = await adminMarketplaceService.approveReview({
      reviewId: req.params.reviewId,
      adminId,
    });
    return successResponse(res, result);
  }),
);

router.post(
  '/reviews/:reviewId/reject',
  asyncHandler(async (req, res) => {
    const adminId = req.user.id;
    const result = await adminMarketplaceService.rejectReview({
      reviewId: req.params.reviewId,
      adminId,
      reason: req.body ? req.body.reason : null,
    });
    return successResponse(res, result);
  }),
);

router.delete(
  '/reviews/:reviewId',
  asyncHandler(async (req, res) => {
    const adminId = req.user.id;
    const result = await adminMarketplaceService.removeReview({
      reviewId: req.params.reviewId,
      adminId,
      reason: req.body ? req.body.reason : null,
    });
    return successResponse(res, result);
  }),
);

export default router;