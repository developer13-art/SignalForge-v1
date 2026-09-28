/**
 * Settings Routes
 *
 * @module server/modules/settings/settings.routes
 */
const { Router } = require('express');
const { settingsController } = require('./settings.controller');
const { authenticationMiddleware } = require('../../middleware/authentication.middleware');
const { authorizationMiddleware } = require('../../middleware/authorization.middleware');
const { asyncHandler } = require('../../lib/async-handler');

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
module.exports = router;