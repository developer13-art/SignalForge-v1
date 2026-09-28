/**
 * Admin Withdrawal Repository
 *
 * @module server/modules/admin/withdrawals/admin-withdrawal.repository
 */

import { db } from '../../../database';
import { nowIso } from '@signalforge/shared/utils/date.util';

export async function listWithdrawals({ filters = {}, pagination = {} }) {
  const conditions = [];
  const params = [];

  if (filters.status) {
    params.push(filters.status);
    conditions.push(`w.status = $${params.length}`);
  }

  if (filters.userId) {
    params.push(filters.userId);
    conditions.push(`w.user_id = $${params.length}`);
  }

  if (filters.method) {
    params.push(filters.method);
    conditions.push(`w.method = $${params.length}`);
  }

  if (filters.source) {
    params.push(filters.source);
    conditions.push(`w.source = $${params.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = pagination.limit || 20;
  const offset = pagination.offset || 0;

  const { rows } = await db.query(
    `SELECT w.id, w.user_id, w.amount, w.currency, w.method, w.source,
            w.status, w.notes, w.processed_at, w.created_at, u.email AS user_email
       FROM withdrawal_requests w
       LEFT JOIN users u ON u.id = w.user_id
       ${where}
       ORDER BY w.created_at DESC
       LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total FROM withdrawal_requests w ${where}`,
    params,
  );

  return {
    items: rows,
    total: countResult.rows[0]?.total || 0,
  };
}

export async function findWithdrawalById({ withdrawalId }) {
  const { rows } = await db.query(
    `SELECT * FROM withdrawal_requests WHERE id = $1 LIMIT 1`,
    [withdrawalId],
  );
  return rows[0] || null;
}

export async function updateWithdrawalStatus({ withdrawalId, status, adminId, reason }) {
  const { rowCount } = await db.query(
    `UPDATE withdrawal_requests
        SET status = $1,
            rejection_reason = $2,
            processed_by = $3,
            processed_at = $4,
            updated_at = $4
      WHERE id = $5`,
    [status, reason || null, adminId, nowIso(), withdrawalId],
  );
  return rowCount > 0;
}

export async function countByStatus() {
  const { rows } = await db.query(
    `SELECT status, COUNT(*)::int AS count, COALESCE(SUM(amount), 0)::numeric AS total_amount
       FROM withdrawal_requests
      GROUP BY status`,
  );
  return rows;
}

export const adminWithdrawalRepository = {
  listWithdrawals,
  findWithdrawalById,
  updateWithdrawalStatus,
  countByStatus,
};