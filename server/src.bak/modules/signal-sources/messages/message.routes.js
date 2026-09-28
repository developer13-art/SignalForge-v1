/**
 * Message Routes
 *
 * Express routes for raw source message operations. All routes require
 * authentication and are mounted under /api/messages.
 *
 * @module server/modules/signal-sources/messages/message.routes
 */

import { Router } from 'express';
import { messageController } from './message.controller';
import { authenticationMiddleware } from '../../../middleware/authentication.middleware';
import { asyncHandler } from '../../../lib/async-handler';

const router = Router();

router.use(authenticationMiddleware);

router.get(
  '/',
  asyncHandler(messageController.listMessages),
);

router.get(
  '/:messageId',
  asyncHandler(messageController.getMessage),
);

router.get(
  '/:messageId/status',
  asyncHandler(messageController.getMessageProcessingStatus),
);

router.get(
  '/:messageId/fingerprint',
  asyncHandler(messageController.getMessageFingerprint),
);

router.post(
  '/:messageId/reprocess',
  asyncHandler(messageController.reprocessMessage),
);

router.delete(
  '/:messageId',
  asyncHandler(messageController.deleteMessage),
);

export default router;