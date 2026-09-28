/**
 * Preferences Routes
 *
 * @module signalforge/server/modules/users/preferences/routes
 */

import { Router } from 'express';

import { PreferencesController } from './preferences.controller.js';
import { authenticationMiddleware } from '../../../middleware/authentication.middleware.js';

export function buildPreferencesRouter(controller = null) {
  const router = Router();
  const preferencesController = controller || new PreferencesController();

  router.use(authenticationMiddleware());

  router.get('/', preferencesController.getPreferences);
  router.patch('/', preferencesController.updatePreferences);

  return router;
}

export default buildPreferencesRouter;