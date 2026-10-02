/**
 * Broker Routes
 *
 * @module signalforge/server/modules/brokers/routes
 */
const { Router } = require('express');
const { BrokerController } = require('./broker.controller.js');
const { buildAccountRouter } = require('./accounts/account.routes.js');
const { authenticationMiddleware } = require('../../middleware/authentication.middleware.js');
const { requireAdminMiddleware } = require('../../middleware/require-admin.middleware.js');
function buildBrokerRouter(controller = null) {
  const router = Router();
  const brokerController = controller || new BrokerController();

  router.get('/', authenticationMiddleware(), brokerController.listBrokers);
  router.post('/', authenticationMiddleware(), requireAdminMiddleware(), brokerController.createBroker);

  router.get('/broker-specs/:server', authenticationMiddleware(), brokerController.getBrokerSpec);
  router.get('/symbols/:platform/candidates/:symbol', authenticationMiddleware(), brokerController.getSymbolCandidates);
  router.get('/symbols/:platform/resolve/:symbol', authenticationMiddleware(), brokerController.resolveSymbol);

  router.get(
    '/accounts/:accountId/connection-logs',
    authenticationMiddleware(),
    brokerController.listConnectionLogs,
  );

  router.use(buildAccountRouter(brokerController.accountController));

  router.get('/:brokerId', authenticationMiddleware(), brokerController.getBroker);
  router.patch('/:brokerId', authenticationMiddleware(), requireAdminMiddleware(), brokerController.updateBroker);
  router.delete('/:brokerId', authenticationMiddleware(), requireAdminMiddleware(), brokerController.deleteBroker);

  return router;
}
module.exports = buildBrokerRouter;
module.exports.buildBrokerRouter = buildBrokerRouter;
