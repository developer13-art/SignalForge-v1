/**
 * Provenance Routes
 *
 * @module server/modules/solana/provenance/provenance.routes
 */
const { Router } = require('express');
const { provenanceController } = require('./provenance.controller');
const { authenticationMiddleware } = require('../../../middleware/authentication.middleware');
const { asyncHandler } = require('../../../lib/async-handler');

const router = Router();

router.use(authenticationMiddleware);

router.get(
  '/pending',
  asyncHandler(provenanceController.listPending),
);

router.get(
  '/status-breakdown',
  asyncHandler(provenanceController.getStatusBreakdown),
);

router.get(
  '/signals/:signalId',
  asyncHandler(provenanceController.getProvenanceBySignal),
);

router.get(
  '/providers/:providerId',
  asyncHandler(provenanceController.listByProvider),
);

router.post(
  '/verify',
  asyncHandler(provenanceController.verifyProcessingHash),
);

router.post(
  '/:provenanceId/confirm',
  asyncHandler(provenanceController.confirmAnchor),
);

router.post(
  '/:provenanceId/fail',
  asyncHandler(provenanceController.failAnchor),
);

router.get(
  '/:provenanceId',
  asyncHandler(provenanceController.getProvenance),
);
module.exports = router;