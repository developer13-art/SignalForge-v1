/**
 * Signal Classification Routes
 *
 * @module signalforge/server/modules/signal-classification/routes
 */

import { Router } from 'express';

import { ClassificationController } from './classification.controller.js';
import { authenticationMiddleware } from '../../middleware/authentication.middleware.js';
import { requireAdminMiddleware } from '../../middleware/require-admin.middleware.js';

export function buildClassificationRouter(controller = null) {
  const router = Router();
  const classificationController = controller || new ClassificationController();

  router.use(authenticationMiddleware());

  router.post('/classify', classificationController.classifyMessage);
  router.get('/messages/:messageId', classificationController.getByMessageId);
  router.get('/messages/:messageId/history', classificationController.listByMessageId);

  router.get('/list', requireAdminMiddleware(), classificationController.list);
  router.get('/stats', requireAdminMiddleware(), classificationController.stats);

  return router;
}

export default buildClassificationRouter;