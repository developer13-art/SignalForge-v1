/**
 * Wallet Routes
 *
 * @module server/modules/solana/wallets/wallet.routes
 */

import { Router } from 'express';
import { walletController } from './wallet.controller';
import { authenticationMiddleware } from '../../../middleware/authentication.middleware';
import { asyncHandler } from '../../../lib/async-handler';

const router = Router();

router.use(authenticationMiddleware);

router.get(
  '/',
  asyncHandler(walletController.listWallets),
);

router.get(
  '/primary',
  asyncHandler(walletController.getPrimaryWallet),
);

router.get(
  '/count',
  asyncHandler(walletController.countWallets),
);

router.post(
  '/siws/begin',
  asyncHandler(walletController.beginConnect),
);

router.post(
  '/siws/complete',
  asyncHandler(walletController.completeConnect),
);

router.post(
  '/:walletId/set-primary',
  asyncHandler(walletController.setPrimary),
);

router.patch(
  '/:walletId/label',
  asyncHandler(walletController.updateLabel),
);

router.delete(
  '/:walletId',
  asyncHandler(walletController.disconnectWallet),
);

router.get(
  '/:walletId',
  asyncHandler(walletController.getWallet),
);

export default router;