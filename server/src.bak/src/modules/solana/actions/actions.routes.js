'use strict';

const express = require('express');

const actionsController = require('./actions.controller');
const actionsMiddleware = require('./actions.middleware');

/**
 * SignalForge - Solana Actions Routes
 *
 * Mounts the Solana Actions specification endpoints and the internal
 * Blink management endpoints. Public Actions endpoints intentionally
 * bypass JWT authentication because they are consumed by wallets and
 * X (Twitter) clients that cannot present a SignalForge session.
 * Internal Blink management endpoints require authentication.
 */

const router = express.Router();

const getRateLimiter = actionsMiddleware.buildGetRateLimiter();
const postRateLimiter = actionsMiddleware.buildPostRateLimiter();

function chain(...middlewares) {
  return middlewares.filter(Boolean);
}

router.use(actionsMiddleware.requestIdMiddleware);
router.use(actionsMiddleware.protocolHeadersMiddleware);
router.use(actionsMiddleware.metricsMiddleware);

router.route('/:actionType')
  .options(actionsMiddleware.corsMiddleware, (req, res) => res.status(204).end())
  .get(
    ...chain(
      actionsMiddleware.corsMiddleware,
      getRateLimiter,
      actionsMiddleware.blockchainIdsMiddleware,
      actionsController.handleGet,
    ),
  )
  .post(
    ...chain(
      actionsMiddleware.corsMiddleware,
      postRateLimiter,
      actionsMiddleware.blockchainIdsMiddleware,
      actionsMiddleware.contentEncodingMiddleware,
      actionsController.handlePost,
    ),
  );

router.get(
  '/blinks/stats/owner',
  actionsMiddleware.corsMiddleware,
  actionsController.handleGetOwnerStats,
);

router.get(
  '/blinks/:blinkId/stats',
  actionsMiddleware.corsMiddleware,
  actionsController.handleGetBlinkStats,
);

router.get(
  '/blinks/:blinkId/conversions',
  actionsMiddleware.corsMiddleware,
  actionsController.handleListConversions,
);

router.post(
  '/blinks/:blinkId/share',
  actionsMiddleware.corsMiddleware,
  actionsController.handleRecordShare,
);

router.post(
  '/blinks/:blinkId/click',
  actionsMiddleware.corsMiddleware,
  actionsController.handleRecordClick,
);

router.get(
  '/blinks/:blinkId',
  actionsMiddleware.corsMiddleware,
  actionsController.handleGetBlink,
);

router.get(
  '/blinks',
  actionsMiddleware.corsMiddleware,
  actionsController.handleListBlinks,
);

router.post(
  '/blinks',
  actionsMiddleware.corsMiddleware,
  actionsController.handleCreateBlink,
);

router.post(
  '/blinks/:blinkId/pause',
  actionsMiddleware.corsMiddleware,
  actionsController.handlePauseBlink,
);

router.post(
  '/blinks/:blinkId/resume',
  actionsMiddleware.corsMiddleware,
  actionsController.handleResumeBlink,
);

router.post(
  '/blinks/:blinkId/archive',
  actionsMiddleware.corsMiddleware,
  actionsController.handleArchiveBlink,
);

router.use(actionsMiddleware.errorHandlerMiddleware);

module.exports = router;