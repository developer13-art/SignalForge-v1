/**
 * Plan Routes
 *
 * @module signalforge/server/modules/subscriptions/plans/routes
 */

import { Router } from 'express';

import { PlanController } from './controller.js';
import { authenticationMiddleware } from '../../../middleware/authentication.middleware.js';
import { requireAdminMiddleware } from '../../../middleware/require-admin.middleware.js';

export function buildPlanRouter(controller = null) {
  const router = Router();
  const planController = controller || new PlanController();

  router.get('/plans', planController.listPlans);
  router.get('/plans/code/:code', planController.getPlanByCode);
  router.get('/plans/:planId', planController.getPlan);

  router.use(authenticationMiddleware());

  router.post('/plans', requireAdminMiddleware(), planController.createPlan);
  router.patch('/plans/:planId', requireAdminMiddleware(), planController.updatePlan);
  router.delete('/plans/:planId', requireAdminMiddleware(), planController.deletePlan);

  return router;
}

export default buildPlanRouter;