/**
 * Trade Shadow Routes
 *
 * @module signalforge/server/modules/trade-shadow/routes
 */
const { Router } = require('express');
const { ShadowController } = require('./shadow.controller.js');
const { authenticationMiddleware } = require('../../middleware/authentication.middleware.js');
function buildShadowRouter(controller = null) {
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
module.exports = buildShadowRouter;
module.exports.buildShadowRouter = buildShadowRouter;
