/**
 * Marketplace Revenue Service
 *
 * Computes marketplace revenue: platform commission on provider
 * subscriptions sold through the marketplace.
 *
 * @module server/modules/executive/revenue/marketplace-revenue.service
 */

import { db } from '../../../database';

export async function getRevenue({ from, to, granularity = 'day' }) {
  const fromDate = from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const toDate = to || new Date().toISOString();

  const dateTrunc = granularity === 'month' ? 'month' : granularity === 'week' ? 'week' : 'day';

  const { rows: totalRows } = await db.query(
    `SELECT
       COALESCE(SUM(platform_commission), 0)::numeric AS total,
       COUNT(*)::int AS count
       FROM provider_subscriptions
      WHERE status = 'ACTIVE'
        AND created_at >= $1 AND created_at <= $2`,
    [fromDate, toDate],
  );

  const { rows: seriesRows } = await db.query(
    `SELECT DATE_TRUNC($1, created_at) AS bucket,
            COALESCE(SUM(platform_commission), 0)::numeric AS amount,
            COUNT(*)::int AS count
       FROM provider_subscriptions
      WHERE status = 'ACTIVE'
        AND created_at >= $2 AND created_at <= $3
      GROUP BY bucket
      ORDER BY bucket ASC`,
    [dateTrunc, fromDate, toDate],
  );

  return {
    range: { from: fromDate, to: toDate },
    total: Number(totalRows[0]?.total || 0),
    count: totalRows[0]?.count || 0,
    series: seriesRows.map((row) => ({
      bucket: row.bucket,
      amount: Number(row.amount || 0),
      count: row.count,
    })),
  };
}

export const marketplaceRevenueService = {
  getRevenue,
};