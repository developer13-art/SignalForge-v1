/**
 * Plan Routes
 *
 * @module signalforge/server/modules/subscriptions/plans/routes
 */
const { Router } = require('express');
const { PlanController } = require('./controller.js');
const { authenticationMiddleware } = require('../../../middleware/authentication.middleware.js');
const { requireAdminMiddleware } = require('../../../middleware/require-admin.middleware.js');
function buildPlanRouter(controller = null) {
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
module.exports = buildPlanRouter;
module.exports.buildPlanRouter = buildPlanRouter;
