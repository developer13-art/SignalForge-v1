/**
 * Risk Routes
 *
 * @module signalforge/server/modules/risk/routes
 */

import { Router } from 'express';

import { RiskController } from './risk.controller.js';
import { authenticationMiddleware } from '../../middleware/authentication.middleware.js';
import { requireAdminMiddleware } from '../../middleware/require-admin.middleware.js';

export function buildRiskRouter(controller = null) {
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

export default buildRiskRouter;