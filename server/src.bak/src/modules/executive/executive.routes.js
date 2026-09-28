/**
 * Executive Routes
 *
 * Express routes for the executive BI console. All routes require
 * authentication and admin/executive authorization.
 *
 * @module server/modules/executive/executive.routes
 */
const { Router } = require('express');
const { executiveController } = require('./executive.controller');
const { authenticationMiddleware } = require('../../middleware/authentication.middleware');
const { authorizationMiddleware } = require('../../middleware/authorization.middleware');
const { asyncHandler } = require('../../lib/async-handler');

const router = Router();

router.use(authenticationMiddleware);
router.use(authorizationMiddleware(['ADMIN', 'SUPER_ADMIN']));

router.get(
  '/dashboard',
  asyncHandler(executiveController.getDashboard),
);

router.get(
  '/revenue',
  asyncHandler(executiveController.getRevenueBreakdown),
);

router.get(
  '/growth',
  asyncHandler(executiveController.getGrowthBreakdown),
);

router.get(
  '/retention',
  asyncHandler(executiveController.getRetention),
);

router.get(
  '/conversion',
  asyncHandler(executiveController.getConversion),
);

router.get(
  '/financial-report',
  asyncHandler(executiveController.getFinancialReport),
);
module.exports = router;