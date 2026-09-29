/**
 * IB Routes
 *
 * Express routes for Introducing Broker operations. All routes require
 * authentication.
 *
 * @module server/modules/ib/ib.routes
 */
const { Router } = require('express');
const { ibController } = require('./ib.controller');
const { authenticationMiddleware } = require('../../middleware/authentication.middleware');
const { asyncHandler } = require('../../lib/async-handler');

const router = Router();

router.use(authenticationMiddleware());

router.get(
  '/dashboard',
  asyncHandler(ibController.getDashboard),
);

router.get(
  '/links',
  asyncHandler(ibController.listLinks),
);

router.post(
  '/links',
  asyncHandler(ibController.createLink),
);

router.delete(
  '/links/:linkId',
  asyncHandler(ibController.deactivateLink),
);

router.get(
  '/referrals',
  asyncHandler(ibController.listReferrals),
);

router.get(
  '/revenue',
  asyncHandler(ibController.getRevenue),
);

router.get(
  '/revenue/entries',
  asyncHandler(ibController.listRevenueEntries),
);
module.exports = router;