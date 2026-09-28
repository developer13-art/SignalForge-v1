/**
 * Attestation Routes
 *
 * @module server/modules/solana/attestations/attestation.routes
 */
const { Router } = require('express');
const { attestationController } = require('./attestation.controller');
const { authenticationMiddleware } = require('../../../middleware/authentication.middleware');
const { asyncHandler } = require('../../../lib/async-handler');

const router = Router();

router.use(authenticationMiddleware);

router.get(
  '/pending',
  asyncHandler(attestationController.listPending),
);

router.get(
  '/status-breakdown',
  asyncHandler(attestationController.getStatusBreakdown),
);

router.get(
  '/subject/:subjectType/:subjectId',
  asyncHandler(attestationController.listAttestationsBySubject),
);

router.post(
  '/',
  asyncHandler(attestationController.createAttestation),
);

router.post(
  '/:attestationId/revoke',
  asyncHandler(attestationController.revokeAttestation),
);

router.post(
  '/:attestationId/anchored',
  asyncHandler(attestationController.markAnchored),
);

router.post(
  '/:attestationId/failed',
  asyncHandler(attestationController.markFailed),
);

router.get(
  '/:attestationId',
  asyncHandler(attestationController.getAttestation),
);
module.exports = router;