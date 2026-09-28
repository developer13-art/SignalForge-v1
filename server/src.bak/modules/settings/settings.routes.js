/**
 * Settings Routes
 *
 * @module server/modules/settings/settings.routes
 */

import { Router } from 'express';
import { settingsController } from './settings.controller';
import { authenticationMiddleware } from '../../middleware/authentication.middleware';
import { authorizationMiddleware } from '../../middleware/authorization.middleware';
import { asyncHandler } from '../../lib/async-handler';

const router = Router();

router.get(
  '/public',
  asyncHandler(settingsController.listPublicSettings),
);

router.use(authenticationMiddleware);
router.use(authorizationMiddleware(['ADMIN', 'SUPER_ADMIN']));

router.get(
  '/',
  asyncHandler(settingsController.listSettings),
);

router.post(
  '/bulk',
  asyncHandler(settingsController.getBulkSettings),
);

router.post(
  '/by-categories',
  asyncHandler(settingsController.getSettingsByCategories),
);

router.get(
  '/:key',
  asyncHandler(settingsController.getSetting),
);

router.put(
  '/:key',
  asyncHandler(settingsController.setSetting),
);

router.delete(
  '/:key',
  asyncHandler(settingsController.deleteSetting),
);

export default router;