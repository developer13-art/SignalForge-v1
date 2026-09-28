/**
 * REST API Source Routes
 *
 * @module signalforge/server/modules/signal-sources/rest-api/routes
 */
const { Router } = require('express');
const { RestApiController } = require('./rest-api.controller.js');
const { authenticationMiddleware } = require('../../../middleware/authentication.middleware.js');
function buildRestApiRouter(controller = null) {
  const router = Router();
  const restApiController = controller || new RestApiController();

  router.post('/signal', restApiController.submitSignal);

  router.use(authenticationMiddleware());

  router.post('/keys', restApiController.createKey);
  router.get('/keys', restApiController.listKeys);
  router.patch('/keys/:keyId', restApiController.updateKey);
  router.delete('/keys/:keyId', restApiController.deleteKey);

  return router;
}
module.exports = buildRestApiRouter;
module.exports.buildRestApiRouter = buildRestApiRouter;
