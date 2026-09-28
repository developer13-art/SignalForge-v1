/**
 * Admin Trade Routes
 *
 * @module server/modules/admin/trades/admin-trade.routes
 */
const { Router } = require('express');
const { adminTradeMonitorService } = require('./admin-trade-monitor.service');
const { asyncHandler } = require('../../../lib/async-handler');
const { successResponse } = require('../../../lib/response/success.response');
const { paginatedResponse } = require('../../../lib/response/paginated.response');

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { page, limit, status, userId, symbol, from, to } = req.query;

    const result = await adminTradeMonitorService.listTrades({
      filters: { status, userId, symbol, from, to },
      pagination: { page, limit },
    });

    return paginatedResponse(res, { items: result.items, meta: result.meta });
  }),
);

router.get(
  '/status-breakdown',
  asyncHandler(async (req, res) => {
    const breakdown = await adminTradeMonitorService.getStatusBreakdown({ since: req.query.since });
    return successResponse(res, { breakdown });
  }),
);

router.get(
  '/:tradeId',
  asyncHandler(async (req, res) => {
    const details = await adminTradeMonitorService.getTradeDetails({ tradeId: req.params.tradeId });
    return successResponse(res, details);
  }),
);

router.post(
  '/:tradeId/force-close',
  asyncHandler(async (req, res) => {
    const adminId = req.user.id;
    const result = await adminTradeMonitorService.forceCloseTrade({
      tradeId: req.params.tradeId,
      adminId,
      reason: req.body ? req.body.reason : null,
    });
    return successResponse(res, result);
  }),
);
module.exports = router;