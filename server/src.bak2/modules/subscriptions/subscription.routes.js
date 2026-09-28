/**
 * Subscription Routes
 *
 * @module signalforge/server/modules/subscriptions/routes
 */
const { Router } = require('express');
const { SubscriptionController } = require('./subscription.controller.js');
const { buildPlanRouter } = require('./plans/plan.routes.js');
const { authenticationMiddleware } = require('../../middleware/authentication.middleware.js');
const { requireAdminMiddleware } = require('../../middleware/require-admin.middleware.js');
function buildSubscriptionRouter(controller = null) {
  const router = Router();
  const subscriptionController = controller || new SubscriptionController();

  router.use(buildPlanRouter(subscriptionController.planController));

  router.use(authenticationMiddleware());

  router.post('/subscriptions', subscriptionController.subscribe);
  router.get('/subscriptions', subscriptionController.listSubscriptions);
  router.get('/subscriptions/active', subscriptionController.getActiveSubscription);
  router.get('/subscriptions/latest', subscriptionController.getLatestSubscription);
  router.get('/subscriptions/:subscriptionId', subscriptionController.getSubscription);
  router.post('/subscriptions/:subscriptionId/cancel', subscriptionController.cancel);
  router.post('/subscriptions/:subscriptionId/resume', subscriptionController.resume);

  router.post('/subscriptions/upgrade', subscriptionController.upgrade);
  router.post('/subscriptions/downgrade', subscriptionController.downgrade);

  router.get('/usage', subscriptionController.getUsage);
  router.post('/usage/increment', subscriptionController.incrementUsage);
  router.get('/usage/check', subscriptionController.checkUsage);

  router.post(
    '/admin/process-lifecycle',
    requireAdminMiddleware(),
    subscriptionController.processLifecycle,
  );

  return router;
}
module.exports = buildSubscriptionRouter;
module.exports.buildSubscriptionRouter = buildSubscriptionRouter;
