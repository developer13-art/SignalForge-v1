/**
 * TradingView Routes
 *
 * @module signalforge/server/modules/signal-sources/tradingview/routes
 */
const { Router } = require('express');
const { TradingViewController } = require('./tradingview.controller.js');
const { authenticationMiddleware } = require('../../../middleware/authentication.middleware.js');
function buildTradingViewRouter(controller = null) {
  const router = Router();
  const tradingViewController = controller || new TradingViewController();

  router.use(authenticationMiddleware());

  router.post('/webhooks', tradingViewController.createWebhook);
  router.get('/webhooks', tradingViewController.listWebhooks);
  router.patch('/webhooks/:webhookId', tradingViewController.updateWebhook);
  router.post('/webhooks/:webhookId/rotate-secret', tradingViewController.rotateSecret);
  router.delete('/webhooks/:webhookId', tradingViewController.deleteWebhook);

  return router;
}
module.exports = buildTradingViewRouter;
module.exports.buildTradingViewRouter = buildTradingViewRouter;
