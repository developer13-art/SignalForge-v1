/**
 * Admin Trade Repository
 *
 * @module server/modules/admin/trades/admin-trade.repository
 */

import { db } from '../../../database';
import { nowIso } from '@signalforge/shared/utils/date.util';

export async function listTrades({ filters = {}, pagination = {} }) {
  const conditions = [];
  const params = [];

  if (filters.status) {
    params.push(filters.status);
    conditions.push(`t.status = $${params.length}`);
  }

  if (filters.userId) {
    params.push(filters.userId);
    conditions.push(`t.user_id = $${params.length}`);
  }

  if (filters.symbol) {
    params.push(filters.symbol);
    conditions.push(`t.symbol = $${params.length}`);
  }

  if (filters.from) {
    params.push(filters.from);
    conditions.push(`t.opened_at >= $${params.length}`);
  }

  if (filters.to) {
    params.push(filters.to);
    conditions.push(`t.opened_at <= $${params.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = pagination.limit || 20;
  const offset = pagination.offset || 0;

  const { rows } = await db.query(
    `SELECT t.id, t.user_id, t.symbol, t.direction, t.volume, t.entry_price, t.exit_price,
            t.realized_profit, t.status, t.opened_at, t.closed_at, u.email AS user_email
       FROM trades t
       LEFT JOIN users u ON u.id = t.user_id
       ${where}
       ORDER BY t.opened_at DESC
       LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total FROM trades t ${where}`,
    params,
  );

  return {
    items: rows,
    total: countResult.rows[0]?.total || 0,
  };
}

export async function findTradeById({ tradeId }) {
  const { rows } = await db.query(
    `SELECT * FROM trades WHERE id = $1 LIMIT 1`,
    [tradeId],
  );
  return rows[0] || null;
}

export async function listTradeEvents({ tradeId }) {
  const { rows } = await db.query(
    `SELECT id, event_type, actor_type, actor_id, details, created_at
       FROM trade_events
      WHERE trade_id = $1
      ORDER BY created_at ASC`,
    [tradeId],
  );
  return rows;
}

export async function markTradeForcedClose({ tradeId, adminId, reason }) {
  const { rowCount } = await db.query(
    `UPDATE trades
        SET status = 'CLOSED',
            closed_at = $1,
            closed_by = $2,
            closure_reason = $3,
            updated_at = $1
      WHERE id = $4`,
    [nowIso(), adminId, reason || 'ADMIN_FORCED', tradeId],
  );
  return rowCount > 0;
}

export async function countByStatus({ since }) {
  const params = [];
  let where = '';

  if (since) {
    params.push(since);
    where = `WHERE opened_at >= $1`;
  }

  const { rows } = await db.query(
    `SELECT status, COUNT(*)::int AS count FROM trades ${where} GROUP BY status`,
    params,
  );
  return rows;
}

export const adminTradeRepository = {
  listTrades,
  findTradeById,
  listTradeEvents,
  markTradeForcedClose,
  countByStatus,
};