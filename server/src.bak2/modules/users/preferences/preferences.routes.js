/**
 * Preferences Routes
 *
 * @module signalforge/server/modules/users/preferences/routes
 */
const { Router } = require('express');
const { PreferencesController } = require('./preferences.controller.js');
const { authenticationMiddleware } = require('../../../middleware/authentication.middleware.js');
function buildPreferencesRouter(controller = null) {
  const router = Router();
  const preferencesController = controller || new PreferencesController();

  router.use(authenticationMiddleware());

  router.get('/', preferencesController.getPreferences);
  router.patch('/', preferencesController.updatePreferences);

  return router;
}
module.exports = buildPreferencesRouter;
module.exports.buildPreferencesRouter = buildPreferencesRouter;
