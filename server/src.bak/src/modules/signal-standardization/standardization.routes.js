/**
 * Signal Standardization Routes
 *
 * @module signalforge/server/modules/signal-standardization/routes
 */
const { Router } = require('express');
const { StandardizationController } = require('./standardization.controller.js');
const { authenticationMiddleware } = require('../../middleware/authentication.middleware.js');
const { requireAdminMiddleware } = require('../../middleware/require-admin.middleware.js');
function buildStandardizationRouter(controller = null) {
  const router = Router();
  const standardizationController = controller || new StandardizationController();

  router.use(authenticationMiddleware());

  router.post('/standardize', standardizationController.standardize);

  router.get('/signals', standardizationController.list);
  router.get('/signals/by-signal-id/:signalId', standardizationController.getBySignalId);
  router.get('/signals/by-message-id/:rawMessageId', standardizationController.getByRawMessageId);
  router.get('/signals/by-fingerprint/:fingerprint', standardizationController.getByFingerprint);

  router.patch(
    '/signals/:signalId/status',
    requireAdminMiddleware(),
    standardizationController.updateStatus,
  );

  router.get('/stats', requireAdminMiddleware(), standardizationController.stats);

  return router;
}
module.exports = buildStandardizationRouter;
module.exports.buildStandardizationRouter = buildStandardizationRouter;
