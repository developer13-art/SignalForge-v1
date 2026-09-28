/**
 * DNA Profile Routes
 *
 * @module signalforge/server/modules/provider-dna/profile/routes
 */
const { Router } = require('express');
const { ProfileController } = require('./profile.controller.js');
const { authenticationMiddleware } = require('../../../middleware/authentication.middleware.js');
function buildProfileRouter(controller = null) {
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
module.exports = buildProfileRouter;
module.exports.buildProfileRouter = buildProfileRouter;
