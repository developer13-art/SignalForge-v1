/**
 * AI Signal Intelligence Routes
 *
 * @module signalforge/server/modules/ai-signal-intelligence/routes
 */
const { Router } = require('express');
const { AiController } = require('./ai.controller.js');
const { authenticationMiddleware } = require('../../middleware/authentication.middleware.js');
const { requireAdminMiddleware } = require('../../middleware/require-admin.middleware.js');
function buildAiRouter(controller = null) {
  const router = Router();
  const aiController = controller || new AiController();

  router.use(authenticationMiddleware());

  router.post('/parse', aiController.parse);
  router.get('/parses/:parseId', aiController.getParse);
  router.get('/messages/:messageId/parses', aiController.listParsesByMessage);
  router.get('/parses', requireAdminMiddleware(), aiController.listParses);

  router.post('/confidence/score', aiController.scoreConfidence);
  router.get('/confidence/signals/:signalId', aiController.getConfidence);
  router.get('/confidence/stats', requireAdminMiddleware(), aiController.confidenceStats);

  router.get('/overview', requireAdminMiddleware(), aiController.overview);
  router.get('/logs', requireAdminMiddleware(), aiController.listLogs);

  return router;
}
module.exports = buildAiRouter;
module.exports.buildAiRouter = buildAiRouter;
