/**
 * Signal Standardization Routes
 *
 * @module signalforge/server/modules/signal-standardization/routes
 */

import { Router } from 'express';

import { StandardizationController } from './standardization.controller.js';
import { authenticationMiddleware } from '../../middleware/authentication.middleware.js';
import { requireAdminMiddleware } from '../../middleware/require-admin.middleware.js';

export function buildStandardizationRouter(controller = null) {
  const router = Router();
  const standardizationController = controller || new StandardizationController();

  router.use(authenticationMiddleware());

  router.post('/standardize', standardizationController.standardize);

  router.get('/signals', standardizationController.list);
  router.get('/signals/by-signal-id/:signalId', standardizationController.getBySignalId);
  router.get('/signals/by-message-id/:rawMessageId', standardizationController.getByRawMessageId);
  router.get('/signals/by-fingerprint/:fingerprint', standardizationController.getByFingerprint);

  router.patch(
    '/signals/:signalId/status',
    requireAdminMiddleware(),
    standardizationController.updateStatus,
  );

  router.get('/stats', requireAdminMiddleware(), standardizationController.stats);

  return router;
}

export default buildStandardizationRouter;