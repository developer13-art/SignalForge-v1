/**
 * Executive Routes
 *
 * Express routes for the executive BI console. All routes require
 * authentication and admin/executive authorization.
 *
 * @module server/modules/executive/executive.routes
 */

import { Router } from 'express';
import { executiveController } from './executive.controller';
import { authenticationMiddleware } from '../../middleware/authentication.middleware';
import { authorizationMiddleware } from '../../middleware/authorization.middleware';
import { asyncHandler } from '../../lib/async-handler';

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

export default router;