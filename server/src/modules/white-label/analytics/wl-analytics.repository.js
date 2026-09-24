/**
 * White Label Analytics Repository
 *
 * Low-level aggregation queries for white-label analytics.
 *
 * @module server/modules/white-label/analytics/wl-analytics.repository
 */

import { db } from '../../../database';

export async function countUsers({ projectId, from, to }) {
  const conditions = ['wl_project_id = $1'];
  const params = [projectId];

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
    `SELECT COUNT(*)::int AS total FROM users ${where}`,
    params,
  );

  return rows[0]?.total || 0;
}

export async function countActiveUsers({ projectId }) {
  const { rows } = await db.query(
    `SELECT COUNT(*)::int AS total
       FROM users
      WHERE wl_project_id = $1 AND status = 'ACTIVE'`,
    [projectId],
  );
  return rows[0]?.total || 0;
}

export async function sumRevenue({ projectId, from, to }) {
  const conditions = ['s.wl_project_id = $1', `p.status = 'SUCCEEDED'`];
  const params = [projectId];

  if (from) {
    params.push(from);
    conditions.push(`p.created_at >= $${params.length}`);
  }

  if (to) {
    params.push(to);
    conditions.push(`p.created_at <= $${params.length}`);
  }

  const where = `WHERE ${conditions.join(' AND ')}`;

  const { rows } = await db.query(
    `SELECT COALESCE(SUM(p.amount), 0)::numeric AS total
       FROM subscriptions s
       LEFT JOIN payments p ON p.subscription_id = s.id
       ${where}`,
    params,
  );

  return Number(rows[0]?.total || 0);
}

export const wlAnalyticsRepository = {
  countUsers,
  countActiveUsers,
  sumRevenue,
};