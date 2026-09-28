/**
 * User Growth Service
 *
 * Computes user growth metrics (new users, cumulative users, growth
 * rate) for a given window and granularity. Feeds the executive
 * dashboard and financial reporting.
 *
 * @module server/modules/executive/growth/user-growth.service
 */

import { db } from '../../../database';

const VALID_GRANULARITIES = Object.freeze(['day', 'week', 'month']);

function normalizeGranularity(granularity) {
  const g = granularity || 'day';
  return VALID_GRANULARITIES.includes(g) ? g : 'day';
}

function normalizeRange({ from, to }) {
  const toDate = to || new Date().toISOString();
  const fromDate = from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  return { from: fromDate, to: toDate };
}

export async function getGrowth({ from, to, granularity }) {
  const range = normalizeRange({ from, to });
  const g = normalizeGranularity(granularity);
  const dateTrunc = g === 'month' ? 'month' : g === 'week' ? 'week' : 'day';

  const { rows: seriesRows } = await db.query(
    `SELECT DATE_TRUNC($1, created_at) AS bucket, COUNT(*)::int AS count
       FROM users
      WHERE created_at >= $2 AND created_at <= $3
      GROUP BY bucket
      ORDER BY bucket ASC`,
    [dateTrunc, range.from, range.to],
  );

  const { rows: totalRows } = await db.query(
    `SELECT
       COUNT(*)::int AS total_users,
       COUNT(*) FILTER (WHERE created_at >= $1 AND created_at <= $2)::int AS new_in_period,
       COUNT(*) FILTER (WHERE status = 'ACTIVE')::int AS active_users,
       COUNT(*) FILTER (WHERE kyc_status = 'VERIFIED')::int AS kyc_verified,
       COUNT(*) FILTER (WHERE email_verified_at IS NOT NULL)::int AS email_verified
       FROM users`,
    [range.from, range.to],
  );

  const { rows: priorRows } = await db.query(
    `SELECT COUNT(*)::int AS prior_users
       FROM users
      WHERE created_at < $1`,
    [range.from],
  );

  const priorUsers = priorRows[0]?.prior_users || 0;
  const newUsers = totalRows[0]?.new_in_period || 0;
  const growthRate = priorUsers > 0 ? newUsers / priorUsers : null;

  const series = seriesRows.map((row) => ({
    bucket: row.bucket,
    newUsers: row.count,
  }));

  let cumulative = priorUsers;

  for (const point of series) {
    cumulative += point.newUsers;
    point.cumulative = cumulative;
  }

  return {
    range,
    granularity: g,
    totalUsers: totalRows[0]?.total_users || 0,
    activeUsers: totalRows[0]?.active_users || 0,
    kycVerifiedUsers: totalRows[0]?.kyc_verified || 0,
    emailVerifiedUsers: totalRows[0]?.email_verified || 0,
    newUsersInPeriod: newUsers,
    priorUsers,
    growthRate,
    series,
  };
}

export async function getNewUsersCount({ from, to }) {
  const range = normalizeRange({ from, to });

  const { rows } = await db.query(
    `SELECT COUNT(*)::int AS count
       FROM users
      WHERE created_at >= $1 AND created_at <= $2`,
    [range.from, range.to],
  );

  return rows[0]?.count || 0;
}

export async function getActiveUsersCount() {
  const { rows } = await db.query(
    `SELECT COUNT(*)::int AS count FROM users WHERE status = 'ACTIVE'`,
  );
  return rows[0]?.count || 0;
}

export async function getUserVerificationBreakdown() {
  const { rows } = await db.query(
    `SELECT
       COUNT(*) FILTER (WHERE email_verified_at IS NOT NULL)::int AS email_verified,
       COUNT(*) FILTER (WHERE phone_verified_at IS NOT NULL)::int AS phone_verified,
       COUNT(*) FILTER (WHERE kyc_status = 'VERIFIED')::int AS kyc_verified,
       COUNT(*)::int AS total
       FROM users`,
  );

  const row = rows[0] || { email_verified: 0, phone_verified: 0, kyc_verified: 0, total: 0 };

  return {
    emailVerified: row.email_verified,
    phoneVerified: row.phone_verified,
    kycVerified: row.kyc_verified,
    total: row.total,
  };
}

export const userGrowthService = {
  getGrowth,
  getNewUsersCount,
  getActiveUsersCount,
  getUserVerificationBreakdown,
};