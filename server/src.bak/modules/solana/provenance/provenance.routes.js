/**
 * Provenance Routes
 *
 * @module server/modules/solana/provenance/provenance.routes
 */

import { Router } from 'express';
import { provenanceController } from './provenance.controller';
import { authenticationMiddleware } from '../../../middleware/authentication.middleware';
import { asyncHandler } from '../../../lib/async-handler';

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

export default router;