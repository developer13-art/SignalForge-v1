/**
 * Trade State Routes
 *
 * @module signalforge/server/modules/trade-state/routes
 */
const { Router } = require('express');
const { TradeStateController } = require('./trade-state.controller.js');
const { authenticationMiddleware } = require('../../middleware/authentication.middleware.js');
const { requireAdminMiddleware } = require('../../middleware/require-admin.middleware.js');
function buildTradeStateRouter(controller = null) {
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
module.exports = buildTradeStateRouter;
module.exports.buildTradeStateRouter = buildTradeStateRouter;
