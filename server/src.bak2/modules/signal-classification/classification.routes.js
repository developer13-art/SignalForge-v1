/**
 * Signal Classification Routes
 *
 * @module signalforge/server/modules/signal-classification/routes
 */
const { Router } = require('express');
const { ClassificationController } = require('./classification.controller.js');
const { authenticationMiddleware } = require('../../middleware/authentication.middleware.js');
const { requireAdminMiddleware } = require('../../middleware/require-admin.middleware.js');
function buildClassificationRouter(controller = null) {
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
module.exports = buildClassificationRouter;
module.exports.buildClassificationRouter = buildClassificationRouter;
