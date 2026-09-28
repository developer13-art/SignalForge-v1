/**
 * API Key Routes
 *
 * @module server/modules/security/api-key.routes
 */
const { Router } = require('express');
const { apiKeyController } = require('./api-key.controller');
const { authenticationMiddleware } = require('../../middleware/authentication.middleware');
const { asyncHandler } = require('../../lib/async-handler');

const router = Router();

router.use(authenticationMiddleware);

router.get(
  '/',
  asyncHandler(apiKeyController.listApiKeys),
);

router.post(
  '/',
  asyncHandler(apiKeyController.createApiKey),
);

router.post(
  '/:apiKeyId/revoke',
  asyncHandler(apiKeyController.revokeApiKey),
);

router.delete(
  '/:apiKeyId',
  asyncHandler(apiKeyController.deleteApiKey),
);
module.exports = router;