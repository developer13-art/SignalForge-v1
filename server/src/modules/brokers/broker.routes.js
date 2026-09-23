/**
 * Broker Routes
 *
 * @module signalforge/server/modules/brokers/routes
 */

import { Router } from 'express';

import { BrokerController } from './broker.controller.js';
import { buildAccountRouter } from './accounts/account.routes.js';
import { authenticationMiddleware } from '../../middleware/authentication.middleware.js';
import { requireAdminMiddleware } from '../../middleware/require-admin.middleware.js';

export function buildBrokerRouter(controller = null) {
  const router = Router();
  const brokerController = controller || new BrokerController();

  router.get('/brokers', authenticationMiddleware(), brokerController.listBrokers);
  router.get('/brokers/:brokerId', authenticationMiddleware(), brokerController.getBroker);
  router.post('/brokers', authenticationMiddleware(), requireAdminMiddleware(), brokerController.createBroker);
  router.patch('/brokers/:brokerId', authenticationMiddleware(), requireAdminMiddleware(), brokerController.updateBroker);
  router.delete('/brokers/:brokerId', authenticationMiddleware(), requireAdminMiddleware(), brokerController.deleteBroker);

  router.get('/broker-specs/:server', authenticationMiddleware(), brokerController.getBrokerSpec);
  router.get('/symbols/:platform/candidates/:symbol', authenticationMiddleware(), brokerController.getSymbolCandidates);
  router.get('/symbols/:platform/resolve/:symbol', authenticationMiddleware(), brokerController.resolveSymbol);

  router.get(
    '/accounts/:accountId/connection-logs',
    authenticationMiddleware(),
    brokerController.listConnectionLogs,
  );

  router.use(buildAccountRouter(brokerController.accountController));

  return router;
}

export default buildBrokerRouter;