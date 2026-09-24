/**
 * Solana Routes
 *
 * Express routes for the Solana module. Sub-routers handle wallets,
 * attestations, provenance, payments, and verification.
 *
 * @module server/modules/solana/solana.routes
 */

import { Router } from 'express';
import { solanaController } from './solana.controller';
import { authenticationMiddleware } from '../../middleware/authentication.middleware';
import { asyncHandler } from '../../lib/async-handler';

import walletRoutes from './wallets/wallet.routes';
import attestationRoutes from './attestations/attestation.routes';
import provenanceRoutes from './provenance/provenance.routes';
import paymentRoutes from './payments/solana-payment.routes';
import verificationRoutes from './verification/verification.routes';

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
  authenticationMiddleware,
  asyncHandler(solanaController.getOverview),
);

router.use('/wallets', walletRoutes);
router.use('/attestations', attestationRoutes);
router.use('/provenance', provenanceRoutes);
router.use('/payments', paymentRoutes);
router.use('/verification', verificationRoutes);

export default router;