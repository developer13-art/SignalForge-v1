/**
 * Profile Routes
 *
 * @module signalforge/server/modules/users/profile/routes
 */

import { Router } from 'express';

import { ProfileController } from './profile.controller.js';
import { authenticationMiddleware } from '../../../middleware/authentication.middleware.js';

export function buildProfileRouter(controller = null) {
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

export default buildProfileRouter;