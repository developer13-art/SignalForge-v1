/**
 * White Label Routes
 *
 * Express routes for white-label project operations. All routes
 * require authentication.
 *
 * @module server/modules/white-label/white-label.routes
 */

import { Router } from 'express';
import { whiteLabelController } from './white-label.controller';
import { authenticationMiddleware } from '../../middleware/authentication.middleware';
import { asyncHandler } from '../../lib/async-handler';

const router = Router();

router.use(authenticationMiddleware);

router.get(
  '/projects',
  asyncHandler(whiteLabelController.listProjects),
);

router.post(
  '/projects',
  asyncHandler(whiteLabelController.createProject),
);

router.get(
  '/projects/:projectId',
  asyncHandler(whiteLabelController.getProject),
);

router.delete(
  '/projects/:projectId',
  asyncHandler(whiteLabelController.deleteProject),
);

router.patch(
  '/projects/:projectId/branding',
  asyncHandler(whiteLabelController.updateBranding),
);

router.patch(
  '/projects/:projectId/theme',
  asyncHandler(whiteLabelController.updateTheme),
);

router.patch(
  '/projects/:projectId/pricing',
  asyncHandler(whiteLabelController.updateCustomPricing),
);

router.post(
  '/projects/:projectId/domains',
  asyncHandler(whiteLabelController.addDomain),
);

router.post(
  '/projects/:projectId/domains/:domainId/verify',
  asyncHandler(whiteLabelController.verifyDomain),
);

router.delete(
  '/projects/:projectId/domains/:domainId',
  asyncHandler(whiteLabelController.removeDomain),
);

router.get(
  '/projects/:projectId/analytics',
  asyncHandler(whiteLabelController.getAnalytics),
);

export default router;