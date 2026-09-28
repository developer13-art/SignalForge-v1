/**
 * Provider Profile Routes
 *
 * @module signalforge/server/modules/providers/profile/routes
 */

import { Router } from 'express';

import { ProviderProfileController } from './controller.js';
import { authenticationMiddleware } from '../../../middleware/authentication.middleware.js';

export function buildProviderProfileRouter(controller = null) {
  const router = Router();
  const profileController = controller || new ProviderProfileController();

  router.get('/providers', profileController.listPublic);
  router.get('/providers/slug/:slug', profileController.getProfileBySlug);
  router.get('/providers/:providerId', profileController.getProfile);

  router.use(authenticationMiddleware());

  router.get('/providers/me/profile', profileController.getMyProfile);
  router.patch(
    '/providers/:providerId/profile',
    profileController.updateMyProfile,
  );
  router.post(
    '/providers/:providerId/profile/avatar',
    profileController.updateAvatar,
  );
  router.delete(
    '/providers/:providerId/profile/avatar',
    profileController.removeAvatar,
  );

  return router;
}

export default buildProviderProfileRouter;