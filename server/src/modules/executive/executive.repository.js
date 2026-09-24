/**
 * Executive Repository
 *
 * Aggregated cross-cutting queries for the executive dashboard.
 *
 * @module server/modules/executive/executive.repository
 */

import { db } from '../../database';

export async function getPlatformTotals({ from, to }) {
  const fromDate = from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const toDate = to || new Date().toISOString();

  const [users, providers, traders, signals, trades, revenue] = await Promise.all([
    db.query(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE created_at >= $1 AND created_at <= $2)::int AS new_in_period,
         COUNT(*) FILTER (WHERE status = 'ACTIVE')::int AS active
         FROM users`,
      [fromDate, toDate],
    ),
    db.query(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE status = 'ACTIVE')::int AS active
         FROM providers`,
    ),
    db.query(
      `SELECT COUNT(*)::int AS total FROM trader_profiles`,
    ),
    db.query(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE created_at >= $1 AND created_at <= $2)::int AS in_period,
         COUNT(*) FILTER (WHERE status = 'EXECUTED')::int AS executed
         FROM signals`,
      [fromDate, toDate],
    ),
    db.query(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE status = 'OPEN')::int AS open,
         COALESCE(SUM(realized_profit), 0)::numeric AS total_realized_profit
         FROM trades`,
    ),
    db.query(
      `SELECT COALESCE(SUM(amount), 0)::numeric AS total_revenue
         FROM payments
        WHERE status = 'SUCCEEDED' AND created_at >= $1 AND created_at <= $2`,
      [fromDate, toDate],
    ),
  ]);

  return {
    range: { from: fromDate, to: toDate },
    users: users.rows[0] || {},
    providers: providers.rows[0] || {},
    traders: traders.rows[0] || {},
    signals: signals.rows[0] || {},
    trades: {
      total: trades.rows[0]?.total || 0,
      open: trades.rows[0]?.open || 0,
      totalRealizedProfit: Number(trades.rows[0]?.total_realized_profit || 0),
    },
    revenue: Number(revenue.rows[0]?.total_revenue || 0),
  };
}

export async function userGrowthSeries({ from, to, granularity = 'day' }) {
  const dateTrunc = granularity === 'month' ? 'month' : granularity === 'week' ? 'week' : 'day';

  const { rows } = await db.query(
    `SELECT DATE_TRUNC($1, created_at) AS bucket, COUNT(*)::int AS count
       FROM users
      WHERE created_at >= $2 AND created_at <= $3
      GROUP BY bucket
      ORDER BY bucket ASC`,
    [dateTrunc, from, to],
  );
  return rows;
}

export const executiveRepository = {
  getPlatformTotals,
  userGrowthSeries,
};