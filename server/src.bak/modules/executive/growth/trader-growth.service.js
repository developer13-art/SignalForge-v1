/**
 * Trader Growth Service
 *
 * Computes trader growth metrics: new trader profiles, active manual
 * traders, and follower growth.
 *
 * @module server/modules/executive/growth/trader-growth.service
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
       FROM trader_profiles
      WHERE created_at >= $2 AND created_at <= $3
      GROUP BY bucket
      ORDER BY bucket ASC`,
    [dateTrunc, range.from, range.to],
  );

  const { rows: totals } = await db.query(
    `SELECT
       COUNT(*)::int AS total,
       COUNT(*) FILTER (WHERE created_at >= $1 AND created_at <= $2)::int AS new_in_period
       FROM trader_profiles`,
    [range.from, range.to],
  );

  const { rows: followers } = await db.query(
    `SELECT
       COUNT(*)::int AS total_followers,
       COUNT(*) FILTER (WHERE created_at >= $1 AND created_at <= $2)::int AS new_followers
       FROM trader_followers`,
    [range.from, range.to],
  );

  const { rows: priorRows } = await db.query(
    `SELECT COUNT(*)::int AS prior
       FROM trader_profiles
      WHERE created_at < $1`,
    [range.from],
  );

  const prior = priorRows[0]?.prior || 0;
  const newTraders = totals[0]?.new_in_period || 0;
  const growthRate = prior > 0 ? newTraders / prior : null;

  const series = seriesRows.map((row) => ({
    bucket: row.bucket,
    newTraders: row.count,
  }));

  return {
    range,
    granularity: g,
    totalTraders: totals[0]?.total || 0,
    newTradersInPeriod: newTraders,
    priorTraders: prior,
    growthRate,
    totalFollowers: followers[0]?.total_followers || 0,
    newFollowersInPeriod: followers[0]?.new_followers || 0,
    series,
  };
}

export async function getTopFollowedTraders({ limit = 10 }) {
  const { rows } = await db.query(
    `SELECT tp.id, tp.display_name, COUNT(tf.id)::int AS follower_count
       FROM trader_profiles tp
       LEFT JOIN trader_followers tf ON tf.trader_id = tp.id
      GROUP BY tp.id
      ORDER BY follower_count DESC
      LIMIT $1`,
    [limit],
  );

  return rows.map((row) => ({
    traderId: row.id,
    displayName: row.display_name,
    followerCount: row.follower_count,
  }));
}

export const traderGrowthService = {
  getGrowth,
  getTopFollowedTraders,
};