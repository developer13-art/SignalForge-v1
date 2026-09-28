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
module.exports = buildBrokerRouter;
module.exports.buildBrokerRouter = buildBrokerRouter;
