/**
 * Trade State Routes
 *
 * @module signalforge/server/modules/trade-state/routes
 */

import { Router } from 'express';

import { TradeStateController } from './trade-state.controller.js';
import { authenticationMiddleware } from '../../middleware/authentication.middleware.js';
import { requireAdminMiddleware } from '../../middleware/require-admin.middleware.js';

export function buildTradeStateRouter(controller = null) {
  const router = Router();
  const tradeStateController = controller || new TradeStateController();

  router.use(authenticationMiddleware());

  router.post('/trades', tradeStateController.createTrade);
  router.get('/trades', tradeStateController.listTrades);
  router.get('/trades/:tradeId', tradeStateController.getTrade);
  router.patch('/trades/:tradeId', tradeStateController.updateTrade);
  router.get('/signals/:signalId', tradeStateController.getBySignalId);

  router.post('/trades/:tradeId/transition', tradeStateController.transitionState);
  router.post('/trades/:tradeId/close', tradeStateController.closeTrade);
  router.post('/trades/:tradeId/archive', tradeStateController.archiveTrade);
  router.get('/trades/:tradeId/transitions', tradeStateController.getAllowedTransitions);
  router.get('/trades/:tradeId/terminal', tradeStateController.isTerminal);

  router.get('/trades/:tradeId/events', tradeStateController.listTradeEvents);
  router.get('/trades/:tradeId/events/counts', tradeStateController.getEventCounts);

  router.get('/events', tradeStateController.listUserEvents);
  router.get('/status/counts', requireAdminMiddleware(), tradeStateController.getStatusCounts);

  return router;
}

export default buildTradeStateRouter;