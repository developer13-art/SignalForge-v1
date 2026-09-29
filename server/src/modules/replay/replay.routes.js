/**
 * Replay Routes
 *
 * Express routes for replay operations. All routes require
 * authentication.
 *
 * @module server/modules/replay/replay.routes
 */
const { Router } = require('express');
const { replayController } = require('./replay.controller');
const { authenticationMiddleware } = require('../../middleware/authentication.middleware');
const { asyncHandler } = require('../../lib/async-handler');

const router = Router();

router.use(authenticationMiddleware());

router.get(
  '/signals/:signalId',
  asyncHandler(replayController.getSignalReplay),
);

router.get(
  '/trades/:tradeId',
  asyncHandler(replayController.getTradeReplay),
);

router.get(
  '/signals/:signalId/ai',
  asyncHandler(replayController.getAiReplay),
);

router.get(
  '/signals/:signalId/risk',
  asyncHandler(replayController.getRiskReplay),
);

router.get(
  '/trades/:tradeId/execution',
  asyncHandler(replayController.getExecutionReplay),
);

router.get(
  '/providers/:providerId/messages/:externalMessageId',
  asyncHandler(replayController.getProviderMessageReplay),
);

router.get(
  '/system/:correlationId',
  asyncHandler(replayController.getSystemReplay),
);
module.exports = router;