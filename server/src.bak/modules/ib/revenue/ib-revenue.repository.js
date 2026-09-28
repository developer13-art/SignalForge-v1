/**
 * IB Revenue Repository
 *
 * Persistence layer for IB revenue entries.
 *
 * @module server/modules/ib/revenue/ib-revenue.repository
 */

import { db } from '../../../database';
import { nowIso } from '@signalforge/shared/utils/date.util';

export async function insertRevenueEntry({
  partnerUserId,
  referralId,
  amount,
  currency = 'USD',
  status = 'PENDING',
  description,
}) {
  const { rows } = await db.query(
    `INSERT INTO ib_revenue_entries
       (partner_user_id, referral_id, amount, currency, status, description, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
     RETURNING *`,
    [partnerUserId, referralId || null, amount, currency, status, description || null, nowIso()],
  );
  return rows[0];
}

export async function findById({ revenueEntryId }) {
  const { rows } = await db.query(
    `SELECT * FROM ib_revenue_entries WHERE id = $1 LIMIT 1`,
    [revenueEntryId],
  );
  return rows[0] || null;
}

export async function updateStatus({ revenueEntryId, status, rejectionReason }) {
  const { rowCount } = await db.query(
    `UPDATE ib_revenue_entries
        SET status = $1,
            rejection_reason = $2,
            approved_at = CASE WHEN $1 = 'APPROVED' THEN $3 ELSE approved_at END,
            updated_at = $3
      WHERE id = $4`,
    [status, rejectionReason || null, nowIso(), revenueEntryId],
  );
  return rowCount > 0;
}

export async function markPaid({ revenueEntryId }) {
  const { rowCount } = await db.query(
    `UPDATE ib_revenue_entries
        SET status = 'PAID',
            paid_at = $1,
            updated_at = $1
      WHERE id = $2 AND status = 'APPROVED'`,
    [nowIso(), revenueEntryId],
  );
  return rowCount > 0;
}

export async function aggregateByPartner({ partnerUserId, from, to }) {
  const conditions = ['partner_user_id = $1'];
  const params = [partnerUserId];

  if (from) {
    params.push(from);
    conditions.push(`created_at >= $${params.length}`);
  }

  if (to) {
    params.push(to);
    conditions.push(`created_at <= $${params.length}`);
  }

  const where = `WHERE ${conditions.join(' AND ')}`;

  const { rows } = await db.query(
    `SELECT
       COALESCE(SUM(amount) FILTER (WHERE status = 'PENDING'), 0)::numeric AS pending,
       COALESCE(SUM(amount) FILTER (WHERE status = 'APPROVED'), 0)::numeric AS approved,
       COALESCE(SUM(amount) FILTER (WHERE status = 'PAID'), 0)::numeric AS paid,
       COALESCE(SUM(amount) FILTER (WHERE status = 'REJECTED'), 0)::numeric AS rejected,
       COUNT(*)::int AS total_count
       FROM ib_revenue_entries
       ${where}`,
    params,
  );

  return rows[0] || { pending: 0, approved: 0, paid: 0, rejected: 0, total_count: 0 };
}

export async function listRevenueEntries({ partnerUserId, filters = {}, limit = 20, offset = 0 }) {
  const conditions = ['partner_user_id = $1'];
  const params = [partnerUserId];

  if (filters.status) {
    params.push(filters.status);
    conditions.push(`status = $${params.length}`);
  }

  if (filters.from) {
    params.push(filters.from);
    conditions.push(`created_at >= $${params.length}`);
  }

  if (filters.to) {
    params.push(filters.to);
    conditions.push(`created_at <= $${params.length}`);
  }

  const where = `WHERE ${conditions.join(' AND ')}`;

  const { rows } = await db.query(
    `SELECT * FROM ib_revenue_entries
       ${where}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total FROM ib_revenue_entries ${where}`,
    params,
  );

  return {
    items: rows,
    total: countResult.rows[0]?.total || 0,
  };
}

export async function listByStatus({ status }) {
  const { rows } = await db.query(
    `SELECT * FROM ib_revenue_entries
      WHERE status = $1
      ORDER BY created_at ASC`,
    [status],
  );
  return rows;
}

export const ibRevenueRepository = {
  insertRevenueEntry,
  findById,
  updateStatus,
  markPaid,
  aggregateByPartner,
  listRevenueEntries,
  listByStatus,
};