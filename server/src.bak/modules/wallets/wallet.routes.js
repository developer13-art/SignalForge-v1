/**
 * Wallet Routes
 *
 * @module signalforge/server/modules/wallets/routes
 */

import { Router } from 'express';

import { WalletController } from './wallet.controller.js';
import { authenticationMiddleware } from '../../middleware/authentication.middleware.js';
import { requireAdminMiddleware } from '../../middleware/require-admin.middleware.js';

export function buildWalletRouter(controller = null) {
  const router = Router();
  const walletController = controller || new WalletController();

  router.use(authenticationMiddleware());

  router.post('/wallets/ensure', walletController.ensureWallet);
  router.get('/wallets', walletController.listWallets);
  router.get('/wallets/:walletId', walletController.getWallet);
  router.get('/wallets/type/:walletType', walletController.getWalletByType);

  router.post('/wallets/:walletId/credit', walletController.creditWallet);
  router.post('/wallets/:walletId/debit', walletController.debitWallet);

  router.get('/wallets/:walletId/ledger', walletController.listWalletLedgerEntries);
  router.get('/ledger', walletController.listLedgerEntries);
  router.get('/ledger/:entryId', walletController.getLedgerEntry);
  router.post(
    '/ledger/:entryId/reverse',
    requireAdminMiddleware(),
    walletController.reverseLedgerEntry,
  );

  router.post(
    '/wallets/:walletId/freeze',
    requireAdminMiddleware(),
    walletController.freezeWallet,
  );
  router.post(
    '/wallets/:walletId/unfreeze',
    requireAdminMiddleware(),
    walletController.unfreezeWallet,
  );

  router.get(
    '/wallets/:walletId/integrity',
    requireAdminMiddleware(),
    walletController.checkIntegrity,
  );
  router.get(
    '/integrity/all',
    requireAdminMiddleware(),
    walletController.checkAllIntegrity,
  );
  router.post(
    '/wallets/:walletId/recompute',
    requireAdminMiddleware(),
    walletController.recomputeBalance,
  );

  return router;
}

export default buildWalletRouter;