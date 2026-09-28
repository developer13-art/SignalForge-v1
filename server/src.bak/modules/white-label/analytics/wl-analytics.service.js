/**
 * White Label Analytics Service
 *
 * Aggregates analytics for a white-label project: user counts, active
 * subscriptions, revenue, and growth over a time window.
 *
 * @module server/modules/white-label/analytics/wl-analytics.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { db } from '../../../database';

export async function getAnalytics({ projectId, from, to }) {
  if (!projectId) {
    throw new AppError('projectId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

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

  const { rows: userRows } = await db.query(
    `SELECT
       COUNT(*)::int AS total_users,
       COUNT(*) FILTER (WHERE status = 'ACTIVE')::int AS active_users
       FROM users
       ${where}`,
    params,
  );

  const userStats = userRows[0] || { total_users: 0, active_users: 0 };

  const { rows: subRows } = await db.query(
    `SELECT
       COUNT(*)::int AS total_subscriptions,
       COUNT(*) FILTER (WHERE status = 'ACTIVE')::int AS active_subscriptions,
       COALESCE(SUM(amount) FILTER (WHERE status = 'SUCCEEDED'), 0)::numeric AS total_revenue
       FROM subscriptions s
       LEFT JOIN payments p ON p.subscription_id = s.id
       WHERE s.wl_project_id = $1`,
    [projectId],
  );

  const subStats = subRows[0] || { total_subscriptions: 0, active_subscriptions: 0, total_revenue: 0 };

  return {
    projectId,
    from: from || null,
    to: to || null,
    users: {
      total: userStats.total_users,
      active: userStats.active_users,
    },
    subscriptions: {
      total: subStats.total_subscriptions,
      active: subStats.active_subscriptions,
    },
    revenue: {
      total: Number(subStats.total_revenue || 0),
      currency: 'USD',
    },
  };
}

export async function getDailyActiveUsers({ projectId, days = 30 }) {
  if (!projectId) {
    throw new AppError('projectId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { rows } = await db.query(
    `SELECT DATE(last_login_at) AS day, COUNT(DISTINCT id)::int AS active_users
       FROM users
      WHERE wl_project_id = $1 AND last_login_at >= $2
      GROUP BY day
      ORDER BY day ASC`,
    [projectId, since],
  );

  return rows.map((row) => ({
    day: row.day,
    activeUsers: row.active_users,
  }));
}

export const wlAnalyticsService = {
  getAnalytics,
  getDailyActiveUsers,
};