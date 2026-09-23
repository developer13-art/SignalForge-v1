/**
 * Signal Collection Routes
 *
 * @module signalforge/server/modules/signal-collection/routes
 */

import { Router } from 'express';

import { CollectionController } from './collection.controller.js';
import { authenticationMiddleware } from '../../middleware/authentication.middleware.js';
import { requireAdminMiddleware } from '../../middleware/require-admin.middleware.js';

export function buildCollectionRouter(controller = null) {
  const router = Router();
  const collectionController = controller || new CollectionController();

  router.use(authenticationMiddleware());
  router.use(requireAdminMiddleware());

  router.get('/items/:itemId', collectionController.getItem);
  router.get('/messages/:messageId', collectionController.getByMessageId);
  router.post('/items/:itemId/cancel', collectionController.cancelItem);
  router.get('/stats', collectionController.getStats);

  return router;
}

export default buildCollectionRouter;