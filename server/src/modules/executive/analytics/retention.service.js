/**
 * Retention Service
 *
 * Computes user retention metrics: cohort retention, daily/weekly/
 * monthly active users, and login frequency for the executive
 * dashboard.
 *
 * @module server/modules/executive/analytics/retention.service
 */

import { db } from '../../../database';

function normalizeRange({ from, to }) {
  const toDate = to || new Date().toISOString();
  const fromDate = from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  return { from: fromDate, to: toDate };
}

export async function getRetention({ from, to }) {
  const range = normalizeRange({ from, to });

  const { rows: dauRows } = await db.query(
    `SELECT COUNT(DISTINCT id)::int AS dau
       FROM users
      WHERE last_login_at >= $1 AND last_login_at <= $2`,
    [range.from, range.to],
  );

  const { rows: wauRows } = await db.query(
    `SELECT COUNT(DISTINCT id)::int AS wau
       FROM users
      WHERE last_login_at >= NOW() - INTERVAL '7 days'`,
  );

  const { rows: mauRows } = await db.query(
    `SELECT COUNT(DISTINCT id)::int AS mau
       FROM users
      WHERE last_login_at >= NOW() - INTERVAL '30 days'`,
  );

  const { rows: newUserRows } = await db.query(
    `SELECT COUNT(*)::int AS new_users
       FROM users
      WHERE created_at >= $1 AND created_at <= $2`,
    [range.from, range.to],
  );

  const { rows: retainedRows } = await db.query(
    `SELECT COUNT(*)::int AS retained_users
       FROM users
      WHERE created_at >= $1
        AND created_at <= $2
        AND last_login_at >= created_at + INTERVAL '7 days'`,
    [range.from, range.to],
  );

  const newUsers = newUserRows[0]?.new_users || 0;
  const retained = retainedRows[0]?.retained_users || 0;
  const d7RetentionRate = newUsers > 0 ? retained / newUsers : null;

  const dau = dauRows[0]?.dau || 0;
  const wau = wauRows[0]?.wau || 0;
  const mau = mauRows[0]?.mau || 0;

  const stickiness = mau > 0 ? dau / mau : null;

  return {
    range,
    dau,
    wau,
    mau,
    stickiness,
    newUsers,
    retainedUsers: retained,
    d7RetentionRate,
  };
}

export async function getLoginFrequencyDistribution() {
  const { rows } = await db.query(
    `SELECT
       COUNT(*) FILTER (WHERE last_login_at >= NOW() - INTERVAL '1 day')::int AS daily,
       COUNT(*) FILTER (WHERE last_login_at >= NOW() - INTERVAL '7 days'
                          AND last_login_at < NOW() - INTERVAL '1 day')::int AS weekly,
       COUNT(*) FILTER (WHERE last_login_at >= NOW() - INTERVAL '30 days'
                          AND last_login_at < NOW() - INTERVAL '7 days')::int AS monthly,
       COUNT(*) FILTER (WHERE last_login_at < NOW() - INTERVAL '30 days'
                          OR last_login_at IS NULL)::int AS inactive
       FROM users`,
  );

  const row = rows[0] || { daily: 0, weekly: 0, monthly: 0, inactive: 0 };

  return {
    daily: row.daily,
    weekly: row.weekly,
    monthly: row.monthly,
    inactive: row.inactive,
  };
}

export async function getCohortRetention({ cohortStart, weeks = 4 }) {
  const { rows } = await db.query(
    `SELECT
       DATE_TRUNC('week', created_at) AS cohort_week,
       COUNT(*)::int AS cohort_size,
       COUNT(*) FILTER (WHERE last_login_at >= created_at + INTERVAL '1 week')::int AS week_1,
       COUNT(*) FILTER (WHERE last_login_at >= created_at + INTERVAL '2 weeks')::int AS week_2,
       COUNT(*) FILTER (WHERE last_login_at >= created_at + INTERVAL '3 weeks')::int AS week_3,
       COUNT(*) FILTER (WHERE last_login_at >= created_at + INTERVAL '4 weeks')::int AS week_4
       FROM users
      WHERE created_at >= $1
      GROUP BY cohort_week
      ORDER BY cohort_week ASC`,
    [cohortStart || new Date(Date.now() - weeks * 7 * 24 * 60 * 60 * 1000).toISOString()],
  );

  return rows.map((row) => ({
    cohortWeek: row.cohort_week,
    cohortSize: row.cohort_size,
    week1: row.week_1,
    week2: row.week_2,
    week3: row.week_3,
    week4: row.week_4,
  }));
}

export const retentionService = {
  getRetention,
  getLoginFrequencyDistribution,
  getCohortRetention,
};