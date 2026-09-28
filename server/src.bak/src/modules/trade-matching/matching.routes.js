/**
 * Trade Matching Routes
 *
 * @module signalforge/server/modules/trade-matching/routes
 */
const { Router } = require('express');
const { MatchingController } = require('./matching.controller.js');
const { authenticationMiddleware } = require('../../middleware/authentication.middleware.js');
function buildMatchingRouter(controller = null) {
  const router = Router();
  const matchingController = controller || new MatchingController();

  router.use(authenticationMiddleware());

  router.post('/match', matchingController.matchTrade);
  router.post('/apply-instruction', matchingController.applyInstruction);
  router.post('/classify-instruction', matchingController.classifyInstruction);

  router.get('/trades/:tradeId/matches', matchingController.listMatchesByTrade);
  router.get('/signals/:signalId/matches', matchingController.listMatchesBySignal);
  router.get('/open-trades', matchingController.listOpenTrades);

  return router;
}
module.exports = buildMatchingRouter;
module.exports.buildMatchingRouter = buildMatchingRouter;
