/**
 * Withdrawal Routes
 *
 * @module signalforge/server/modules/withdrawals/routes
 */
const { Router } = require('express');
const { WithdrawalController } = require('./withdrawal.controller.js');
const { authenticationMiddleware } = require('../../middleware/authentication.middleware.js');
const { requireAdminMiddleware } = require('../../middleware/require-admin.middleware.js');
function buildWithdrawalRouter(controller = null) {
  const router = Router();
  const withdrawalController = controller || new WithdrawalController();

  router.get('/withdrawal-methods', withdrawalController.listSupportedMethods);

  router.use(authenticationMiddleware());

  router.post('/withdrawal-accounts', withdrawalController.addAccount);
  router.get('/withdrawal-accounts', withdrawalController.listAccounts);
  router.get('/withdrawal-accounts/:accountId', withdrawalController.getAccount);
  router.patch('/withdrawal-accounts/:accountId', withdrawalController.updateAccount);
  router.post('/withdrawal-accounts/:accountId/verify', withdrawalController.verifyAccount);
  router.delete('/withdrawal-accounts/:accountId', withdrawalController.removeAccount);

  router.post('/withdrawals', withdrawalController.requestWithdrawal);
  router.get('/withdrawals', withdrawalController.listRequests);
  router.get('/withdrawals/status/counts', withdrawalController.getStatusCounts);
  router.get('/withdrawals/methods/breakdown', withdrawalController.getMethodBreakdown);
  router.get('/withdrawals/:requestId', withdrawalController.getRequest);
  router.post('/withdrawals/:requestId/cancel', withdrawalController.cancelRequest);

  router.get(
    '/admin/withdrawals',
    requireAdminMiddleware(),
    withdrawalController.adminListRequests,
  );
  router.get(
    '/admin/withdrawals/status/counts',
    requireAdminMiddleware(),
    withdrawalController.adminStatusCounts,
  );
  router.get(
    '/admin/withdrawals/methods/breakdown',
    requireAdminMiddleware(),
    withdrawalController.adminMethodBreakdown,
  );
  router.post(
    '/admin/withdrawals/:requestId/approve',
    requireAdminMiddleware(),
    withdrawalController.adminApprove,
  );
  router.post(
    '/admin/withdrawals/:requestId/reject',
    requireAdminMiddleware(),
    withdrawalController.adminReject,
  );
  router.post(
    '/admin/withdrawals/:requestId/process',
    requireAdminMiddleware(),
    withdrawalController.adminProcess,
  );

  return router;
}
module.exports = buildWithdrawalRouter;
module.exports.buildWithdrawalRouter = buildWithdrawalRouter;
