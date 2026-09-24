/**
 * Provider Growth Service
 *
 * Computes provider growth metrics: new providers, active providers,
 * certified providers, and subscribers per period.
 *
 * @module server/modules/executive/growth/provider-growth.service
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

  const { rows: newProviderRows } = await db.query(
    `SELECT DATE_TRUNC($1, created_at) AS bucket, COUNT(*)::int AS count
       FROM providers
      WHERE created_at >= $2 AND created_at <= $3
      GROUP BY bucket
      ORDER BY bucket ASC`,
    [dateTrunc, range.from, range.to],
  );

  const { rows: totals } = await db.query(
    `SELECT
       COUNT(*)::int AS total,
       COUNT(*) FILTER (WHERE status = 'ACTIVE')::int AS active,
       COUNT(*) FILTER (WHERE certification_status IN ('CERTIFIED', 'CONDITIONALLY_CERTIFIED'))::int AS certified,
       COUNT(*) FILTER (WHERE created_at >= $1 AND created_at <= $2)::int AS new_in_period
       FROM providers`,
    [range.from, range.to],
  );

  const { rows: priorRows } = await db.query(
    `SELECT COUNT(*)::int AS prior
       FROM providers
      WHERE created_at < $1`,
    [range.from],
  );

  const prior = priorRows[0]?.prior || 0;
  const newProviders = totals[0]?.new_in_period || 0;
  const growthRate = prior > 0 ? newProviders / prior : null;

  const series = newProviderRows.map((row) => ({
    bucket: row.bucket,
    newProviders: row.count,
  }));

  return {
    range,
    granularity: g,
    totalProviders: totals[0]?.total || 0,
    activeProviders: totals[0]?.active || 0,
    certifiedProviders: totals[0]?.certified || 0,
    newProvidersInPeriod: newProviders,
    priorProviders: prior,
    growthRate,
    series,
  };
}

export async function getSubscriberGrowth({ from, to, granularity }) {
  const range = normalizeRange({ from, to });
  const g = normalizeGranularity(granularity);
  const dateTrunc = g === 'month' ? 'month' : g === 'week' ? 'week' : 'day';

  const { rows } = await db.query(
    `SELECT DATE_TRUNC($1, created_at) AS bucket,
            COUNT(*)::int AS new_subscriptions,
            COUNT(*) FILTER (WHERE status = 'ACTIVE')::int AS active_subscriptions
       FROM provider_subscriptions
      WHERE created_at >= $2 AND created_at <= $3
      GROUP BY bucket
      ORDER BY bucket ASC`,
    [dateTrunc, range.from, range.to],
  );

  return {
    range,
    granularity: g,
    series: rows.map((row) => ({
      bucket: row.bucket,
      newSubscriptions: row.new_subscriptions,
      activeSubscriptions: row.active_subscriptions,
    })),
  };
}

export async function getTopGrowingProviders({ from, to, limit = 10 }) {
  const range = normalizeRange({ from, to });

  const { rows } = await db.query(
    `SELECT p.id, p.display_name,
            COUNT(ps.id)::int AS new_subscribers
       FROM providers p
       LEFT JOIN provider_subscriptions ps
              ON ps.provider_id = p.id
             AND ps.created_at >= $1
             AND ps.created_at <= $2
      GROUP BY p.id
      ORDER BY new_subscribers DESC
      LIMIT $3`,
    [range.from, range.to, limit],
  );

  return rows.map((row) => ({
    providerId: row.id,
    displayName: row.display_name,
    newSubscribers: row.new_subscribers,
  }));
}

export const providerGrowthService = {
  getGrowth,
  getSubscriberGrowth,
  getTopGrowingProviders,
};