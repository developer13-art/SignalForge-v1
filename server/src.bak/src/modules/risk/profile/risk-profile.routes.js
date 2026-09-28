/**
 * Risk Profile Routes
 *
 * @module signalforge/server/modules/risk/profile/routes
 */
const { Router } = require('express');
const { RiskProfileController } = require('./risk-profile.controller.js');
const { authenticationMiddleware } = require('../../../middleware/authentication.middleware.js');
function buildRiskProfileRouter(controller = null) {
  const router = Router();
  const riskProfileController = controller || new RiskProfileController();

  router.use(authenticationMiddleware());

  router.get('/', riskProfileController.getProfile);
  router.patch('/:profileId', riskProfileController.updateProfile);
  router.post('/:profileId/emergency-stop', riskProfileController.activateEmergencyStop);
  router.delete('/:profileId/emergency-stop', riskProfileController.deactivateEmergencyStop);

  return router;
}
module.exports = buildRiskProfileRouter;
module.exports.buildRiskProfileRouter = buildRiskProfileRouter;
