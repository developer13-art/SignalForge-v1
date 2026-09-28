/**
 * Risk Routes
 *
 * @module signalforge/server/modules/risk/routes
 */
const { Router } = require('express');
const { RiskController } = require('./risk.controller.js');
const { authenticationMiddleware } = require('../../middleware/authentication.middleware.js');
const { requireAdminMiddleware } = require('../../middleware/require-admin.middleware.js');
function buildRiskRouter(controller = null) {
  const router = Router();
  const riskController = controller || new RiskController();

  router.use(authenticationMiddleware());

  router.get('/profile', riskController.getProfile);
  router.patch('/profile/:profileId', riskController.updateProfile);
  router.post('/profile/:profileId/emergency-stop', riskController.activateEmergencyStop);
  router.delete('/profile/:profileId/emergency-stop', riskController.deactivateEmergencyStop);

  router.post('/evaluate', riskController.evaluate);
  router.get('/decisions', riskController.listDecisions);
  router.get('/decisions/stats', requireAdminMiddleware(), riskController.decisionStats);
  router.get('/decisions/:decisionId', riskController.getDecision);
  router.get('/signals/:signalId/decisions', riskController.listDecisionsBySignal);

  router.get('/events', requireAdminMiddleware(), riskController.listRiskEvents);

  router.post('/calculate/lot-size', riskController.calculateLotSize);
  router.post('/calculate/position-size', riskController.calculatePositionSize);

  return router;
}
module.exports = buildRiskRouter;
module.exports.buildRiskRouter = buildRiskRouter;
