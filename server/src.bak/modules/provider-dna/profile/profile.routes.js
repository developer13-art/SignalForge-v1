/**
 * DNA Profile Routes
 *
 * @module signalforge/server/modules/provider-dna/profile/routes
 */

import { Router } from 'express';

import { ProfileController } from './profile.controller.js';
import { authenticationMiddleware } from '../../../middleware/authentication.middleware.js';

export function buildProfileRouter(controller = null) {
  const router = Router({ mergeParams: true });
  const profileController = controller || new ProfileController();

  router.use(authenticationMiddleware());

  router.get('/', profileController.getFullProfile);
  router.get('/language', profileController.getLanguageProfile);
  router.get('/symbol', profileController.getSymbolProfile);
  router.get('/risk', profileController.getRiskProfile);
  router.get('/management', profileController.getManagementProfile);
  router.get('/reliability', profileController.getReliabilityProfile);

  return router;
}

export default buildProfileRouter;