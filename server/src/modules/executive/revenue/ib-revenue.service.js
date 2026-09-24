/**
 * IB Revenue Service
 *
 * Aggregates Introducing Broker revenue entries for executive
 * reporting.
 *
 * @module server/modules/executive/revenue/ib-revenue.service
 */

import { db } from '../../../database';

export async function getRevenue({ from, to, granularity = 'day' }) {
  const fromDate = from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const toDate = to || new Date().toISOString();

  const dateTrunc = granularity === 'month' ? 'month' : granularity === 'week' ? 'week' : 'day';

  const { rows: totalRows } = await db.query(
    `SELECT
       COALESCE(SUM(amount), 0)::numeric AS total,
       COUNT(*)::int AS count
       FROM ib_revenue_entries
      WHERE created_at >= $1 AND created_at <= $2`,
    [fromDate, toDate],
  );

  const { rows: seriesRows } = await db.query(
    `SELECT DATE_TRUNC($1, created_at) AS bucket,
            COALESCE(SUM(amount), 0)::numeric AS amount,
            COUNT(*)::int AS count
       FROM ib_revenue_entries
      WHERE created_at >= $2 AND created_at <= $3
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

export const ibRevenueService = {
  getRevenue,
};