/**
 * Admin Payment Repository
 *
 * Persistence layer for administrative payment management.
 *
 * @module server/modules/admin/payments/admin-payment.repository
 */

import { db } from '../../../database';
import { nowIso } from '@signalforge/shared/utils/date.util';

export async function listPayments({ filters = {}, pagination = {} }) {
  const conditions = [];
  const params = [];

  if (filters.status) {
    params.push(filters.status);
    conditions.push(`p.status = $${params.length}`);
  }

  if (filters.userId) {
    params.push(filters.userId);
    conditions.push(`p.user_id = $${params.length}`);
  }

  if (filters.provider) {
    params.push(filters.provider);
    conditions.push(`p.provider = $${params.length}`);
  }

  if (filters.from) {
    params.push(filters.from);
    conditions.push(`p.created_at >= $${params.length}`);
  }

  if (filters.to) {
    params.push(filters.to);
    conditions.push(`p.created_at <= $${params.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = pagination.limit || 20;
  const offset = pagination.offset || 0;

  const { rows } = await db.query(
    `SELECT p.id, p.user_id, p.subscription_id, p.amount, p.currency, p.provider,
            p.provider_reference, p.status, p.method, p.created_at, p.confirmed_at,
            u.email AS user_email
       FROM payments p
       LEFT JOIN users u ON u.id = p.user_id
       ${where}
       ORDER BY p.created_at DESC
       LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total FROM payments p ${where}`,
    params,
  );

  return {
    items: rows,
    total: countResult.rows[0]?.total || 0,
  };
}

export async function findPaymentById({ paymentId }) {
  const { rows } = await db.query(
    `SELECT * FROM payments WHERE id = $1 LIMIT 1`,
    [paymentId],
  );
  return rows[0] || null;
}

export async function markRefunded({ paymentId, adminId, reason, refundAmount }) {
  const { rowCount } = await db.query(
    `UPDATE payments
        SET status = 'REFUNDED',
            refunded_amount = $1,
            refund_reason = $2,
            refunded_by = $3,
            refunded_at = $4,
            updated_at = $4
      WHERE id = $5`,
    [refundAmount, reason || null, adminId, nowIso(), paymentId],
  );
  return rowCount > 0;
}

export async function countByStatus({ since }) {
  const params = [];
  let where = '';

  if (since) {
    params.push(since);
    where = `WHERE created_at >= $1`;
  }

  const { rows } = await db.query(
    `SELECT status, COUNT(*)::int AS count, COALESCE(SUM(amount), 0)::numeric AS total_amount
       FROM payments
       ${where}
      GROUP BY status`,
    params,
  );
  return rows;
}

export async function sumRevenueByProvider({ since }) {
  const params = [];
  let where = `WHERE status = 'SUCCEEDED'`;

  if (since) {
    params.push(since);
    where += ` AND created_at >= $1`;
  }

  const { rows } = await db.query(
    `SELECT provider, COALESCE(SUM(amount), 0)::numeric AS total_amount, COUNT(*)::int AS count
       FROM payments
       ${where}
      GROUP BY provider`,
    params,
  );
  return rows;
}

export const adminPaymentRepository = {
  listPayments,
  findPaymentById,
  markRefunded,
  countByStatus,
  sumRevenueByProvider,
};