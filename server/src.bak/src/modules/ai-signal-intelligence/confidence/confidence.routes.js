/**
 * Confidence Routes
 *
 * @module signalforge/server/modules/ai-signal-intelligence/confidence/routes
 */
const { Router } = require('express');
const { ConfidenceController } = require('./confidence.controller.js');
const { authenticationMiddleware } = require('../../../middleware/authentication.middleware.js');
const { requireAdminMiddleware } = require('../../../middleware/require-admin.middleware.js');
function buildConfidenceRouter(controller = null) {
  const router = Router();
  const confidenceController = controller || new ConfidenceController();

  router.use(authenticationMiddleware());

  router.post('/score', confidenceController.score);
  router.get('/signals/:signalId', confidenceController.getBySignal);
  router.get('/stats', requireAdminMiddleware(), confidenceController.average);

  return router;
}
module.exports = buildConfidenceRouter;
module.exports.buildConfidenceRouter = buildConfidenceRouter;
