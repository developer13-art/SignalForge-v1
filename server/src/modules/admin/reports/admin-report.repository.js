/**
 * Admin Report Repository
 *
 * Persistence layer for aggregated admin reporting queries.
 *
 * @module server/modules/admin/reports/admin-report.repository
 */

import { db } from '../../../database';

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

  return rows.map((row) => ({ bucket: row.bucket, count: row.count }));
}

export async function providerGrowthSeries({ from, to, granularity = 'day' }) {
  const dateTrunc = granularity === 'month' ? 'month' : granularity === 'week' ? 'week' : 'day';

  const { rows } = await db.query(
    `SELECT DATE_TRUNC($1, created_at) AS bucket, COUNT(*)::int AS count
       FROM providers
      WHERE created_at >= $2 AND created_at <= $3
      GROUP BY bucket
      ORDER BY bucket ASC`,
    [dateTrunc, from, to],
  );

  return rows.map((row) => ({ bucket: row.bucket, count: row.count }));
}

export async function signalActivitySeries({ from, to, granularity = 'day' }) {
  const dateTrunc = granularity === 'month' ? 'month' : granularity === 'week' ? 'week' : 'day';

  const { rows } = await db.query(
    `SELECT DATE_TRUNC($1, created_at) AS bucket,
            COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE status = 'EXECUTED')::int AS executed,
            COUNT(*) FILTER (WHERE status IN ('VALIDATION_FAILED', 'RISK_REJECTED'))::int AS rejected
       FROM signals
      WHERE created_at >= $2 AND created_at <= $3
      GROUP BY bucket
      ORDER BY bucket ASC`,
    [dateTrunc, from, to],
  );

  return rows.map((row) => ({
    bucket: row.bucket,
    total: row.total,
    executed: row.executed,
    rejected: row.rejected,
  }));
}

export async function tradeActivitySeries({ from, to, granularity = 'day' }) {
  const dateTrunc = granularity === 'month' ? 'month' : granularity === 'week' ? 'week' : 'day';

  const { rows } = await db.query(
    `SELECT DATE_TRUNC($1, opened_at) AS bucket,
            COUNT(*)::int AS trades,
            COALESCE(SUM(realized_profit), 0)::numeric AS total_profit,
            COUNT(*) FILTER (WHERE realized_profit > 0)::int AS winners,
            COUNT(*) FILTER (WHERE realized_profit < 0)::int AS losers
       FROM trades
      WHERE opened_at >= $2 AND opened_at <= $3
      GROUP BY bucket
      ORDER BY bucket ASC`,
    [dateTrunc, from, to],
  );

  return rows.map((row) => ({
    bucket: row.bucket,
    trades: row.trades,
    totalProfit: Number(row.total_profit || 0),
    winners: row.winners,
    losers: row.losers,
  }));
}

export async function revenueSeries({ from, to, granularity = 'day' }) {
  const dateTrunc = granularity === 'month' ? 'month' : granularity === 'week' ? 'week' : 'day';

  const { rows } = await db.query(
    `SELECT DATE_TRUNC($1, created_at) AS bucket,
            COALESCE(SUM(amount) FILTER (WHERE status = 'SUCCEEDED'), 0)::numeric AS revenue,
            COUNT(*) FILTER (WHERE status = 'SUCCEEDED')::int AS successful_payments
       FROM payments
      WHERE created_at >= $2 AND created_at <= $3
      GROUP BY bucket
      ORDER BY bucket ASC`,
    [dateTrunc, from, to],
  );

  return rows.map((row) => ({
    bucket: row.bucket,
    revenue: Number(row.revenue || 0),
    successfulPayments: row.successful_payments,
  }));
}

export async function referralSettlementSummary({ from, to }) {
  const { rows } = await db.query(
    `SELECT
       COUNT(*)::int AS total_rewards,
       COALESCE(SUM(reward_amount), 0)::numeric AS total_reward_amount,
       COUNT(*) FILTER (WHERE status = 'SETTLED')::int AS settled_count,
       COUNT(*) FILTER (WHERE status = 'PENDING')::int AS pending_count,
       COUNT(*) FILTER (WHERE status = 'UNDER_REVIEW')::int AS under_review_count
       FROM referral_rewards
      WHERE created_at >= $1 AND created_at <= $2`,
    [from, to],
  );

  const row = rows[0] || {};

  return {
    totalRewards: row.total_rewards || 0,
    totalRewardAmount: Number(row.total_reward_amount || 0),
    settledCount: row.settled_count || 0,
    pendingCount: row.pending_count || 0,
    underReviewCount: row.under_review_count || 0,
  };
}

export async function topProvidersByRevenue({ from, to, limit = 10 }) {
  const { rows } = await db.query(
    `SELECT p.id, p.display_name, COALESCE(SUM(pr.amount), 0)::numeric AS revenue
       FROM providers p
       LEFT JOIN provider_revenue pr ON pr.provider_id = p.id AND pr.created_at >= $1 AND pr.created_at <= $2
      GROUP BY p.id
      ORDER BY revenue DESC
      LIMIT $3`,
    [from, to, limit],
  );

  return rows.map((row) => ({
    providerId: row.id,
    displayName: row.display_name,
    revenue: Number(row.revenue || 0),
  }));
}

export const adminReportRepository = {
  userGrowthSeries,
  providerGrowthSeries,
  signalActivitySeries,
  tradeActivitySeries,
  revenueSeries,
  referralSettlementSummary,
  topProvidersByRevenue,
};