/**
 * REST API Source Routes
 *
 * @module signalforge/server/modules/signal-sources/rest-api/routes
 */

import { Router } from 'express';

import { RestApiController } from './rest-api.controller.js';
import { authenticationMiddleware } from '../../../middleware/authentication.middleware.js';

export function buildRestApiRouter(controller = null) {
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

export default buildRestApiRouter;