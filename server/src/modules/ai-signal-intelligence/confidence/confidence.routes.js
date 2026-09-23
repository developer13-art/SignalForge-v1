/**
 * Confidence Routes
 *
 * @module signalforge/server/modules/ai-signal-intelligence/confidence/routes
 */

import { Router } from 'express';

import { ConfidenceController } from './confidence.controller.js';
import { authenticationMiddleware } from '../../../middleware/authentication.middleware.js';
import { requireAdminMiddleware } from '../../../middleware/require-admin.middleware.js';

export function buildConfidenceRouter(controller = null) {
  const router = Router();
  const confidenceController = controller || new ConfidenceController();

  router.use(authenticationMiddleware());

  router.post('/score', confidenceController.score);
  router.get('/signals/:signalId', confidenceController.getBySignal);
  router.get('/stats', requireAdminMiddleware(), confidenceController.average);

  return router;
}

export default buildConfidenceRouter;