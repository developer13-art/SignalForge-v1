/**
 * Admin Broker Routes
 *
 * @module server/modules/admin/brokers/admin-broker.routes
 */
const { Router } = require('express');
const { adminBrokerService } = require('./admin-broker.service');
const { asyncHandler } = require('../../../lib/async-handler');
const { successResponse } = require('../../../lib/response/success.response');
const { paginatedResponse } = require('../../../lib/response/paginated.response');

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { page, limit, userId, platform, accountType, connectionStatus } = req.query;

    const result = await adminBrokerService.listBrokerAccounts({
      filters: { userId, platform, accountType, connectionStatus },
      pagination: { page, limit },
    });

    return paginatedResponse(res, { items: result.items, meta: result.meta });
  }),
);

router.get(
  '/status-breakdown',
  asyncHandler(async (req, res) => {
    const breakdown = await adminBrokerService.getConnectionStatusBreakdown();
    return successResponse(res, { breakdown });
  }),
);

router.get(
  '/:brokerAccountId',
  asyncHandler(async (req, res) => {
    const account = await adminBrokerService.getBrokerAccountDetails({
      brokerAccountId: req.params.brokerAccountId,
    });
    return successResponse(res, { account });
  }),
);

router.post(
  '/:brokerAccountId/disconnect',
  asyncHandler(async (req, res) => {
    const adminId = req.user.id;
    const result = await adminBrokerService.forceDisconnectBroker({
      brokerAccountId: req.params.brokerAccountId,
      adminId,
      reason: req.body ? req.body.reason : null,
    });
    return successResponse(res, result);
  }),
);
module.exports = router;