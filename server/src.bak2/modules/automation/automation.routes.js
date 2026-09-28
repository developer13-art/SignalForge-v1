/**
 * Automation Routes
 *
 * @module signalforge/server/modules/automation/routes
 */
const { Router } = require('express');
const { AutomationController } = require('./automation.controller.js');
const { authenticationMiddleware } = require('../../middleware/authentication.middleware.js');
function buildAutomationRouter(controller = null) {
  const router = Router();
  const automationController = controller || new AutomationController();

  router.use(authenticationMiddleware());

  router.post('/rules', automationController.createRule);
  router.get('/rules', automationController.listRules);
  router.get('/rules/:ruleId', automationController.getRule);
  router.patch('/rules/:ruleId', automationController.updateRule);
  router.delete('/rules/:ruleId', automationController.deleteRule);
  router.post('/rules/:ruleId/enable', automationController.enableRule);
  router.post('/rules/:ruleId/disable', automationController.disableRule);
  router.get('/rules/:ruleId/triggers', automationController.listTriggersForRule);

  router.post('/evaluate', automationController.evaluate);
  router.post('/test', automationController.testRule);
  router.get('/triggers', automationController.listTriggers);

  return router;
}
module.exports = buildAutomationRouter;
module.exports.buildAutomationRouter = buildAutomationRouter;
