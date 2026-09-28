/**
 * IB Routes
 *
 * Express routes for Introducing Broker operations. All routes require
 * authentication.
 *
 * @module server/modules/ib/ib.routes
 */

import { Router } from 'express';
import { ibController } from './ib.controller';
import { authenticationMiddleware } from '../../middleware/authentication.middleware';
import { asyncHandler } from '../../lib/async-handler';

const router = Router();

router.use(authenticationMiddleware);

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

export default router;