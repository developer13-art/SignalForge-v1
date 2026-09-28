/**
 * Source Routes
 *
 * @module signalforge/server/modules/signal-sources/routes
 */
const { Router } = require('express');
const { SourceController } = require('./source.controller.js');
const { authenticationMiddleware } = require('../../middleware/authentication.middleware.js');
function buildSourceRouter(controller = null) {
  const router = Router();
  const sourceController = controller || new SourceController();

  router.use(authenticationMiddleware());

  router.post('/', sourceController.createSource);
  router.get('/', sourceController.listSources);
  router.get('/:sourceId', sourceController.getSource);
  router.patch('/:sourceId', sourceController.updateSource);
  router.delete('/:sourceId', sourceController.deleteSource);

  router.post('/:sourceId/connect', sourceController.connectSource);
  router.post('/:sourceId/disconnect', sourceController.disconnectSource);
  router.post('/:sourceId/enable', sourceController.enableSource);
  router.post('/:sourceId/disable', sourceController.disableSource);

  router.get('/:sourceId/messages', sourceController.listMessages);
  router.get('/:sourceId/messages/:messageId', sourceController.getMessage);

  return router;
}
module.exports = buildSourceRouter;
module.exports.buildSourceRouter = buildSourceRouter;
