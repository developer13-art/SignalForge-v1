/**
 * Replay Routes
 *
 * Express routes for replay operations. All routes require
 * authentication.
 *
 * @module server/modules/replay/replay.routes
 */

import { Router } from 'express';
import { replayController } from './replay.controller';
import { authenticationMiddleware } from '../../middleware/authentication.middleware';
import { asyncHandler } from '../../lib/async-handler';

const router = Router();

router.use(authenticationMiddleware);

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

export default router;