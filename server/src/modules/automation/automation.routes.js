/**
 * Automation Routes
 *
 * @module signalforge/server/modules/automation/routes
 */

import { Router } from 'express';

import { AutomationController } from './automation.controller.js';
import { authenticationMiddleware } from '../../middleware/authentication.middleware.js';

export function buildAutomationRouter(controller = null) {
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

export default buildAutomationRouter;