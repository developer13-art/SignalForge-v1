/**
 * Subscription Routes
 *
 * @module signalforge/server/modules/subscriptions/routes
 */

import { Router } from 'express';

import { SubscriptionController } from './subscription.controller.js';
import { buildPlanRouter } from './plans/plan.routes.js';
import { authenticationMiddleware } from '../../middleware/authentication.middleware.js';
import { requireAdminMiddleware } from '../../middleware/require-admin.middleware.js';

export function buildSubscriptionRouter(controller = null) {
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

export default buildSubscriptionRouter;