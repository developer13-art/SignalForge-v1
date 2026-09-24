/**
 * Verification Routes
 *
 * Public read-only verification endpoints plus authenticated audit
 * endpoints. Public routes deliberately expose only public-safe data.
 *
 * @module server/modules/solana/verification/verification.routes
 */

import { Router } from 'express';
import { verificationController } from './verification.controller';
import { authenticationMiddleware } from '../../../middleware/authentication.middleware';
import { asyncHandler } from '../../../lib/async-handler';

const router = Router();

router.get(
  '/attestations/id/:attestationId',
  asyncHandler(verificationController.verifyByAttestationId),
);

router.get(
  '/attestations/hash/:attestationHash',
  asyncHandler(verificationController.verifyByHash),
);

router.get(
  '/signals/:signalId',
  asyncHandler(verificationController.verifySignal),
);

router.get(
  '/processing/:processingHash',
  asyncHandler(verificationController.verifyByProcessingHash),
);

router.get(
  '/audit/attestations/:attestationId',
  authenticationMiddleware,
  asyncHandler(verificationController.auditAttestation),
);

router.get(
  '/audit/provenance/:provenanceId',
  authenticationMiddleware,
  asyncHandler(verificationController.auditProvenance),
);

router.get(
  '/audit/pending',
  authenticationMiddleware,
  asyncHandler(verificationController.auditPending),
);

export default router;