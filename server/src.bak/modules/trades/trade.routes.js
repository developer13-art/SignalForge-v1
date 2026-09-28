/**
 * Trades Routes
 *
 * @module signalforge/server/modules/trades/routes
 */

import { Router } from 'express';

import { TradeController } from './trade.controller.js';
import { authenticationMiddleware } from '../../middleware/authentication.middleware.js';

export function buildTradeRouter(controller = null) {
  const router = Router();
  const tradeController = controller || new TradeController();

  router.use(authenticationMiddleware());

  router.get('/trades', tradeController.listTrades);
  router.get('/trades/open', tradeController.listOpenPositions);
  router.get('/trades/pending', tradeController.listPendingOrders);
  router.get('/trades/closed', tradeController.listClosedTrades);
  router.get('/trades/history', tradeController.getHistory);
  router.get('/trades/history/summary', tradeController.getHistorySummary);
  router.get('/trades/status/counts', tradeController.getStatusCounts);
  router.get('/trades/symbols/breakdown', tradeController.getSymbolBreakdown);
  router.get('/trades/profit/summary', tradeController.sumProfit);

  router.post('/trades/manual-open', tradeController.openManualTrade);
  router.post('/trades/close-all', tradeController.closeAll);

  router.get('/trades/:tradeId', tradeController.getTrade);
  router.post('/trades/:tradeId/manual-close', tradeController.closeManualTrade);
  router.post('/trades/:tradeId/manual-modify', tradeController.modifyManualTrade);
  router.post('/trades/:tradeId/intervene', tradeController.intervene);
  router.post('/trades/:tradeId/archive', tradeController.archiveTrade);
  router.get('/trades/:tradeId/timeline', tradeController.getTimeline);

  return router;
}

export default buildTradeRouter;