/**
 * Solana Routes
 *
 * Express routes for the Solana module. Sub-routers handle wallets,
 * attestations, provenance, payments, and verification.
 *
 * @module server/modules/solana/solana.routes
 */
const { Router } = require('express');
const { solanaController } = require('./solana.controller');
const { authenticationMiddleware } = require('../../middleware/authentication.middleware');
const { asyncHandler } = require('../../lib/async-handler');
const walletRoutes = require('./wallets/wallet.routes');
const attestationRoutes = require('./attestations/attestation.routes');
const provenanceRoutes = require('./provenance/provenance.routes');
const paymentRoutes = require('./payments/solana-payment.routes');
const verificationRoutes = require('./verification/verification.routes');

const router = Router();

router.get(
  '/network',
  asyncHandler(solanaController.getNetworkInfo),
);

router.get(
  '/programs',
  asyncHandler(solanaController.getProgramsInfo),
);

router.get(
  '/health',
  asyncHandler(solanaController.getConnectionHealth),
);

router.get(
  '/overview',
  authenticationMiddleware(),
  asyncHandler(solanaController.getOverview),
);

router.use('/wallets', walletRoutes);
router.use('/attestations', attestationRoutes);
router.use('/provenance', provenanceRoutes);
router.use('/payments', paymentRoutes);
router.use('/verification', verificationRoutes);
module.exports = router;