/**
 * Message Routes
 *
 * Express routes for raw source message operations. All routes require
 * authentication and are mounted under /api/messages.
 *
 * @module server/modules/signal-sources/messages/message.routes
 */
const { Router } = require('express');
const { messageController } = require('./message.controller');
const { authenticationMiddleware } = require('../../../middleware/authentication.middleware');
const { asyncHandler } = require('../../../lib/async-handler');

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
module.exports = router;