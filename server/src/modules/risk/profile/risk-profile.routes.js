/**
 * Risk Profile Routes
 *
 * @module signalforge/server/modules/risk/profile/routes
 */

import { Router } from 'express';

import { RiskProfileController } from './risk-profile.controller.js';
import { authenticationMiddleware } from '../../../middleware/authentication.middleware.js';

export function buildRiskProfileRouter(controller = null) {
  const router = Router();
  const riskProfileController = controller || new RiskProfileController();

  router.use(authenticationMiddleware());

  router.get('/', riskProfileController.getProfile);
  router.patch('/:profileId', riskProfileController.updateProfile);
  router.post('/:profileId/emergency-stop', riskProfileController.activateEmergencyStop);
  router.delete('/:profileId/emergency-stop', riskProfileController.deactivateEmergencyStop);

  return router;
}

export default buildRiskProfileRouter;