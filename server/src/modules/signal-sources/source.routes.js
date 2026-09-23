/**
 * Source Routes
 *
 * @module signalforge/server/modules/signal-sources/routes
 */

import { Router } from 'express';

import { SourceController } from './source.controller.js';
import { authenticationMiddleware } from '../../middleware/authentication.middleware.js';

export function buildSourceRouter(controller = null) {
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

export default buildSourceRouter;