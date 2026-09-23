/**
 * Broker Account Routes
 *
 * @module signalforge/server/modules/brokers/accounts/routes
 */

import { Router } from 'express';

import { AccountController } from './account.controller.js';
import { authenticationMiddleware } from '../../../middleware/authentication.middleware.js';

export function buildAccountRouter(controller = null) {
  const router = Router();
  const accountController = controller || new AccountController();

  router.use(authenticationMiddleware());

  router.post('/accounts', accountController.connectAccount);
  router.get('/accounts', accountController.listAccounts);
  router.get('/accounts/:accountId', accountController.getAccount);
  router.delete('/accounts/:accountId', accountController.removeAccount);
  router.post('/accounts/:accountId/disconnect', accountController.disconnectAccount);
  router.post('/accounts/:accountId/credentials', accountController.updateCredentials);
  router.post('/accounts/:accountId/sync', accountController.syncAccount);
  router.get('/accounts/:accountId/snapshots', accountController.listSnapshots);
  router.get('/accounts/:accountId/health', accountController.checkHealth);

  router.get('/accounts/:accountId/symbols/:symbol/price', accountController.getCurrentPrice);
  router.get(
    '/accounts/:accountId/symbols/:symbol/specification',
    accountController.getSymbolSpecification,
  );

  return router;
}

export default buildAccountRouter;