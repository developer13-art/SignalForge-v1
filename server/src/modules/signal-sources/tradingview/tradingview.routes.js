/**
 * TradingView Routes
 *
 * @module signalforge/server/modules/signal-sources/tradingview/routes
 */

import { Router } from 'express';

import { TradingViewController } from './tradingview.controller.js';
import { authenticationMiddleware } from '../../../middleware/authentication.middleware.js';

export function buildTradingViewRouter(controller = null) {
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

export default buildTradingViewRouter;