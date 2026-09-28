/**
 * Affiliate Routes
 *
 * Express routes for affiliate operations. All routes require
 * authentication. KYC verification is required for withdrawal routes.
 *
 * @module server/modules/affiliate/affiliate.routes
 */
const { Router } = require('express');
const { affiliateController } = require('./affiliate.controller');
const { authenticationMiddleware } = require('../../middleware/authentication.middleware');
const { requireKycVerified } = require('../../middleware/require-kyc-verified.middleware');
const { asyncHandler } = require('../../lib/async-handler');

const router = Router();

router.use(authenticationMiddleware);

router.get(
  '/dashboard',
  asyncHandler(affiliateController.getDashboard),
);

router.get(
  '/links',
  asyncHandler(affiliateController.listLinks),
);

router.post(
  '/links',
  asyncHandler(affiliateController.createLink),
);

router.delete(
  '/links/:linkId',
  asyncHandler(affiliateController.deactivateLink),
);

router.get(
  '/referrals',
  asyncHandler(affiliateController.listReferrals),
);

router.get(
  '/commissions',
  asyncHandler(affiliateController.listCommissions),
);

router.get(
  '/commissions/summary',
  asyncHandler(affiliateController.getCommissionSummary),
);

router.post(
  '/withdrawals',
  requireKycVerified,
  asyncHandler(affiliateController.requestWithdrawal),
);

router.get(
  '/withdrawals',
  asyncHandler(affiliateController.listWithdrawals),
);
module.exports = router;