/**
 * Admin Subscription Repository
 *
 * @module server/modules/admin/subscriptions/admin-subscription.repository
 */

import { db } from '../../../database';
import { nowIso } from '@signalforge/shared/utils/date.util';

export async function listSubscriptions({ filters = {}, pagination = {} }) {
  const conditions = [];
  const params = [];

  if (filters.status) {
    params.push(filters.status);
    conditions.push(`s.status = $${params.length}`);
  }

  if (filters.userId) {
    params.push(filters.userId);
    conditions.push(`s.user_id = $${params.length}`);
  }

  if (filters.planCode) {
    params.push(filters.planCode);
    conditions.push(`s.plan_code = $${params.length}`);
  }

  if (filters.from) {
    params.push(filters.from);
    conditions.push(`s.created_at >= $${params.length}`);
  }

  if (filters.to) {
    params.push(filters.to);
    conditions.push(`s.created_at <= $${params.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = pagination.limit || 20;
  const offset = pagination.offset || 0;

  const { rows } = await db.query(
    `SELECT s.id, s.user_id, s.plan_code, s.status, s.current_period_start, s.current_period_end,
            s.trial_ends_at, s.cancelled_at, s.created_at, u.email AS user_email
       FROM subscriptions s
       LEFT JOIN users u ON u.id = s.user_id
       ${where}
       ORDER BY s.created_at DESC
       LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total FROM subscriptions s ${where}`,
    params,
  );

  return {
    items: rows,
    total: countResult.rows[0]?.total || 0,
  };
}

export async function findSubscriptionById({ subscriptionId }) {
  const { rows } = await db.query(
    `SELECT * FROM subscriptions WHERE id = $1 LIMIT 1`,
    [subscriptionId],
  );
  return rows[0] || null;
}

export async function updateSubscriptionStatus({ subscriptionId, status }) {
  const { rowCount } = await db.query(
    `UPDATE subscriptions
        SET status = $1,
            cancelled_at = CASE WHEN $1 = 'CANCELLED' THEN $2 ELSE cancelled_at END,
            updated_at = $2
      WHERE id = $3`,
    [status, nowIso(), subscriptionId],
  );
  return rowCount > 0;
}

export async function extendSubscriptionPeriod({ subscriptionId, newEndDate }) {
  const { rowCount } = await db.query(
    `UPDATE subscriptions
        SET current_period_end = $1,
            status = 'ACTIVE',
            updated_at = $2
      WHERE id = $3`,
    [newEndDate, nowIso(), subscriptionId],
  );
  return rowCount > 0;
}

export async function countByStatus() {
  const { rows } = await db.query(
    `SELECT status, COUNT(*)::int AS count FROM subscriptions GROUP BY status`,
  );
  return rows;
}

export const adminSubscriptionRepository = {
  listSubscriptions,
  findSubscriptionById,
  updateSubscriptionStatus,
  extendSubscriptionPeriod,
  countByStatus,
};