/**
 * Copy Trading Routes
 *
 * @module signalforge/server/modules/copy-trading/routes
 */
const { Router } = require('express');
const { CopyTradingController } = require('./copy-trading.controller.js');
const { authenticationMiddleware } = require('../../middleware/authentication.middleware.js');
const { requireAdminMiddleware } = require('../../middleware/require-admin.middleware.js');
function buildCopyTradingRouter(controller = null) {
  const router = Router();
  const copyTradingController = controller || new CopyTradingController();

  router.use(authenticationMiddleware());

  router.post('/subscriptions', copyTradingController.subscribe);
  router.get('/subscriptions', copyTradingController.listSubscriptions);
  router.get('/subscriptions/:subscriptionId', copyTradingController.getSubscription);
  router.patch('/subscriptions/:subscriptionId', copyTradingController.updateSubscription);
  router.delete('/subscriptions/:subscriptionId', copyTradingController.unsubscribe);
  router.post('/subscriptions/:subscriptionId/pause', copyTradingController.pauseSubscription);
  router.post('/subscriptions/:subscriptionId/resume', copyTradingController.resumeSubscription);

  router.post('/fan-out', copyTradingController.fanOut);
  router.get('/fan-out/signals/:signalId/batches', copyTradingController.listBatches);
  router.get('/fan-out/batches/:batchId/records', copyTradingController.listRecords);
  router.get('/fan-out/signals/:signalId/status', copyTradingController.fanOutStatus);
  router.get('/fan-out/metrics', requireAdminMiddleware(), copyTradingController.getMetrics);

  router.post(
    '/sync/provider-close/:providerTradeId',
    copyTradingController.syncProviderClose,
  );

  router.get('/latency/summary', requireAdminMiddleware(), copyTradingController.getLatencySummary);
  router.post('/reconcile', copyTradingController.reconcile);

  return router;
}
module.exports = buildCopyTradingRouter;
module.exports.buildCopyTradingRouter = buildCopyTradingRouter;
