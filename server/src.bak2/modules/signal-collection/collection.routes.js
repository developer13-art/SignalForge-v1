/**
 * Signal Collection Routes
 *
 * @module signalforge/server/modules/signal-collection/routes
 */
const { Router } = require('express');
const { CollectionController } = require('./collection.controller.js');
const { authenticationMiddleware } = require('../../middleware/authentication.middleware.js');
const { requireAdminMiddleware } = require('../../middleware/require-admin.middleware.js');
function buildCollectionRouter(controller = null) {
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
module.exports = buildCollectionRouter;
module.exports.buildCollectionRouter = buildCollectionRouter;
