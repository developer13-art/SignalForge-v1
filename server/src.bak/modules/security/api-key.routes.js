/**
 * API Key Routes
 *
 * @module server/modules/security/api-key.routes
 */

import { Router } from 'express';
import { apiKeyController } from './api-key.controller';
import { authenticationMiddleware } from '../../middleware/authentication.middleware';
import { asyncHandler } from '../../lib/async-handler';

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

export default router;