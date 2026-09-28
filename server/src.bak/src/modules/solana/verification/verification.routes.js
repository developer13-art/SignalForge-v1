/**
 * Verification Routes
 *
 * Public read-only verification endpoints plus authenticated audit
 * endpoints. Public routes deliberately expose only public-safe data.
 *
 * @module server/modules/solana/verification/verification.routes
 */
const { Router } = require('express');
const { verificationController } = require('./verification.controller');
const { authenticationMiddleware } = require('../../../middleware/authentication.middleware');
const { asyncHandler } = require('../../../lib/async-handler');

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
module.exports = router;