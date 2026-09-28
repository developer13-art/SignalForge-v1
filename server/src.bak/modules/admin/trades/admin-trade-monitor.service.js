/**
 * Admin Trade Monitor Service
 *
 * @module server/modules/admin/trades/admin-trade-monitor.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { normalizePagination, buildPaginationMeta } from '@signalforge/shared/utils/pagination.util';
import * as repository from './admin-trade.repository';
import { adminService } from '../admin.service';

export async function listTrades({ filters = {}, pagination = {} }) {
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

export async function getTradeDetails({ tradeId }) {
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

export async function forceCloseTrade({ tradeId, adminId, reason }) {
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

export async function getStatusBreakdown({ since }) {
  const rows = await repository.countByStatus({ since });

  const breakdown = {};
  for (const row of rows) {
    breakdown[row.status] = row.count;
  }

  return breakdown;
}

export const adminTradeMonitorService = {
  listTrades,
  getTradeDetails,
  forceCloseTrade,
  getStatusBreakdown,
};