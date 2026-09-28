/**
 * Profile Routes
 *
 * @module signalforge/server/modules/users/profile/routes
 */
const { Router } = require('express');
const { ProfileController } = require('./profile.controller.js');
const { authenticationMiddleware } = require('../../../middleware/authentication.middleware.js');
function buildProfileRouter(controller = null) {
  const router = Router();
  const profileController = controller || new ProfileController();

  router.use(authenticationMiddleware());

  router.get('/', profileController.getProfile);
  router.patch('/', profileController.updateProfile);
  router.delete('/', profileController.deleteProfile);

  router.post('/avatar', profileController.uploadAvatar);
  router.delete('/avatar', profileController.removeAvatar);
  router.get('/avatar/url', profileController.getAvatarUrl);

  return router;
}
module.exports = buildProfileRouter;
module.exports.buildProfileRouter = buildProfileRouter;
