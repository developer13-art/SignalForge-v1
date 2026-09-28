/**
 * Admin Trade Monitor Service
 *
 * @module server/modules/admin/trades/admin-trade-monitor.service
 */
const { AppError } = require('../../../lib/errors/app-error');
const { ERROR_CODES } = require('../../../lib/errors/error-codes');
const { logger } = require('../../../lib/logger');
const { normalizePagination, buildPaginationMeta } = require('@signalforge/shared/utils/pagination.util');
const repository = require('./admin-trade.repository');
const { adminService } = require('../admin.service');
async function listTrades({ filters = {}, pagination = {} }) {
  const { page, limit, offset } = normalizePagination(pagination);

  const result = await repository.listTrades({
    filters,
    pagination: { limit, offset },
  });

  return {
    items: result.items.map((row) => ({
      tradeId: row.id,
      userId: row.user_id,
      userEmail: row.user_email,
      symbol: row.symbol,
      direction: row.direction,
      volume: row.volume,
      entryPrice: row.entry_price,
      exitPrice: row.exit_price,
      realizedProfit: row.realized_profit,
      status: row.status,
      openedAt: row.opened_at,
      closedAt: row.closed_at,
    })),
    meta: buildPaginationMeta({ page, limit, total: result.total }),
  };
}
async function getTradeDetails({ tradeId }) {
  if (!tradeId) {
    throw new AppError('tradeId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const trade = await repository.findTradeById({ tradeId });

  if (!trade) {
    throw new AppError('Trade not found', ERROR_CODES.NOT_FOUND, 404);
  }

  const events = await repository.listTradeEvents({ tradeId });

  return {
    trade,
    events: events.map((e) => ({
      eventId: e.id,
      eventType: e.event_type,
      actorType: e.actor_type,
      actorId: e.actor_id,
      details: e.details,
      createdAt: e.created_at,
    })),
  };
}
async function forceCloseTrade({ tradeId, adminId, reason }) {
  if (!tradeId || !adminId) {
    throw new AppError('tradeId and adminId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const updated = await repository.markTradeForcedClose({ tradeId, adminId, reason });

  if (!updated) {
    throw new AppError('Trade not found', ERROR_CODES.NOT_FOUND, 404);
  }

  await adminService.recordAdminAction({
    adminId,
    action: 'TRADE_FORCE_CLOSE',
    targetType: 'TRADE',
    targetId: tradeId,
    details: { reason },
  });

  logger.info({ tradeId, adminId, reason }, 'Trade force-closed by admin');

  return { closed: true };
}
async function getStatusBreakdown({ since }) {
  const rows = await repository.countByStatus({ since });

  const breakdown = {};
  for (const row of rows) {
    breakdown[row.status] = row.count;
  }

  return breakdown;
}
const adminTradeMonitorService = {
  listTrades,
  getTradeDetails,
  forceCloseTrade,
  getStatusBreakdown,
};
module.exports.adminTradeMonitorService = adminTradeMonitorService;

module.exports.listTrades = listTrades;

module.exports.getTradeDetails = getTradeDetails;

module.exports.forceCloseTrade = forceCloseTrade;

module.exports.getStatusBreakdown = getStatusBreakdown;
