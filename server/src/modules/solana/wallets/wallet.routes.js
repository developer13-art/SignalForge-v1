/**
 * Wallet Routes
 *
 * @module server/modules/solana/wallets/wallet.routes
 */
const { Router } = require('express');
const { walletController } = require('./wallet.controller');
const { authenticationMiddleware } = require('../../../middleware/authentication.middleware');
const { asyncHandler } = require('../../../lib/async-handler');

const router = Router();

router.use(authenticationMiddleware());

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
module.exports = router;