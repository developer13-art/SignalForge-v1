/**
 * User Routes (module-level)
 *
 * @module signalforge/server/modules/users/routes
 */

import { Router } from 'express';

import { UserController } from './user.controller.js';
import { buildProfileRouter } from './profile/profile.routes.js';
import { buildPreferencesRouter } from './preferences/preferences.routes.js';
import { buildSessionRouter } from './sessions/session.routes.js';
import { buildDeviceRouter } from './devices/device.routes.js';
import { authenticationMiddleware } from '../../middleware/authentication.middleware.js';
import { requireAdminMiddleware } from '../../middleware/require-admin.middleware.js';

export function buildUserRouter(controller = null) {
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

export default buildUserRouter;