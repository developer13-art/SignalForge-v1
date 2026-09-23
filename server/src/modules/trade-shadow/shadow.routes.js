/**
 * Trade Shadow Routes
 *
 * @module signalforge/server/modules/trade-shadow/routes
 */

import { Router } from 'express';

import { ShadowController } from './shadow.controller.js';
import { authenticationMiddleware } from '../../middleware/authentication.middleware.js';

export function buildShadowRouter(controller = null) {
  const router = Router();
  const shadowController = controller || new ShadowController();

  router.use(authenticationMiddleware());

  router.post('/compare', shadowController.compareTrades);
  router.get('/shadows', shadowController.listShadows);
  router.get('/shadows/insights', shadowController.getInsights);
  router.get('/shadows/:shadowId', shadowController.getShadow);
  router.post('/shadows/:shadowId/recompute', shadowController.recomputeShadow);

  router.get('/user-trades/:userTradeId', shadowController.getByUserTrade);
  router.get('/provider-trades/:providerTradeId', shadowController.listByProviderTrade);

  return router;
}

export default buildShadowRouter;