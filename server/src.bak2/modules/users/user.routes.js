/**
 * User Routes (module-level)
 *
 * @module signalforge/server/modules/users/routes
 */
const { Router } = require('express');
const { UserController } = require('./user.controller.js');
const { buildProfileRouter } = require('./profile/profile.routes.js');
const { buildPreferencesRouter } = require('./preferences/preferences.routes.js');
const { buildSessionRouter } = require('./sessions/session.routes.js');
const { buildDeviceRouter } = require('./devices/device.routes.js');
const { authenticationMiddleware } = require('../../middleware/authentication.middleware.js');
const { requireAdminMiddleware } = require('../../middleware/require-admin.middleware.js');
function buildUserRouter(controller = null) {
  const router = Router();
  const userController = controller || new UserController();

  router.use(authenticationMiddleware());

  router.get('/me', userController.getMe);
  router.patch('/me', userController.updateMe);
  router.delete('/me', userController.deleteMe);
  router.post('/me/deactivate', userController.deactivateMe);
  router.post('/me/reactivate', userController.reactivateMe);

  router.get('/me/profile', userController.getProfile);
  router.patch('/me/profile', userController.updateProfile);

  router.get('/me/preferences', userController.getPreferences);
  router.patch('/me/preferences', userController.updatePreferences);

  router.use('/me/profile', buildProfileRouter());
  router.use('/me/preferences', buildPreferencesRouter());
  router.use('/me/sessions', buildSessionRouter());
  router.use('/me/devices', buildDeviceRouter());

  router.get('/', requireAdminMiddleware(), userController.listUsers);
  router.get('/stats', requireAdminMiddleware(), userController.getStats);
  router.get('/:userId', requireAdminMiddleware(), userController.getById);

  return router;
}
module.exports = buildUserRouter;
module.exports.buildUserRouter = buildUserRouter;
