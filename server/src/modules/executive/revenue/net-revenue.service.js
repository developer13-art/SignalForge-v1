/**
 * Net Revenue Service
 *
 * Computes net platform revenue by combining all revenue streams and
 * subtracting all platform costs (referral rewards, IB revenue share,
 * affiliate commissions, and payment fees).
 *
 * @module server/modules/executive/revenue/net-revenue.service
 */

import { db } from '../../../database';

export async function getNetRevenue({ from, to, granularity = 'day' }) {
  const fromDate = from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const toDate = to || new Date().toISOString();

  const dateTrunc = granularity === 'month' ? 'month' : granularity === 'week' ? 'week' : 'day';

  const { rows } = await db.query(
    `SELECT DATE_TRUNC($1, created_at) AS bucket,
            COALESCE(SUM(amount), 0)::numeric AS revenue
       FROM payments
      WHERE status = 'SUCCEEDED'
        AND created_at >= $2 AND created_at <= $3
      GROUP BY bucket
      ORDER BY bucket ASC`,
    [dateTrunc, fromDate, toDate],
  );

  const { rows: referralRows } = await db.query(
    `SELECT DATE_TRUNC($1, created_at) AS bucket,
            COALESCE(SUM(reward_amount), 0)::numeric AS cost
       FROM referral_rewards
      WHERE created_at >= $2 AND created_at <= $3
      GROUP BY bucket
      ORDER BY bucket ASC`,
    [dateTrunc, fromDate, toDate],
  );

  const { rows: ibRows } = await db.query(
    `SELECT DATE_TRUNC($1, created_at) AS bucket,
            COALESCE(SUM(amount), 0)::numeric AS cost
       FROM ib_revenue_entries
      WHERE created_at >= $2 AND created_at <= $3
      GROUP BY bucket
      ORDER BY bucket ASC`,
    [dateTrunc, fromDate, toDate],
  );

  const { rows: affiliateRows } = await db.query(
    `SELECT DATE_TRUNC($1, created_at) AS bucket,
            COALESCE(SUM(amount), 0)::numeric AS cost
       FROM affiliate_commissions
      WHERE created_at >= $2 AND created_at <= $3
      GROUP BY bucket
      ORDER BY bucket ASC`,
    [dateTrunc, fromDate, toDate],
  );

  const { rows: feesRows } = await db.query(
    `SELECT DATE_TRUNC($1, created_at) AS bucket,
            COALESCE(SUM(processing_fee), 0)::numeric AS cost
       FROM payments
      WHERE status = 'SUCCEEDED'
        AND created_at >= $2 AND created_at <= $3
      GROUP BY bucket
      ORDER BY bucket ASC`,
    [dateTrunc, fromDate, toDate],
  );

  const map = new Map();

  for (const row of rows) {
    map.set(row.bucket, {
      bucket: row.bucket,
      revenue: Number(row.revenue || 0),
      referralCost: 0,
      ibCost: 0,
      affiliateCost: 0,
      paymentFees: 0,
      net: Number(row.revenue || 0),
    });
  }

  const apply = (rows, field) => {
    for (const row of rows) {
      const entry = map.get(row.bucket) || {
        bucket: row.bucket,
        revenue: 0,
        referralCost: 0,
        ibCost: 0,
        affiliateCost: 0,
        paymentFees: 0,
        net: 0,
      };
      entry[field] = Number(row.cost || 0);
      map.set(row.bucket, entry);
    }
  };

  apply(referralRows, 'referralCost');
  apply(ibRows, 'ibCost');
  apply(affiliateRows, 'affiliateCost');
  apply(feesRows, 'paymentFees');

  const series = Array.from(map.values())
    .map((entry) => ({
      ...entry,
      net:
        entry.revenue -
        entry.referralCost -
        entry.ibCost -
        entry.affiliateCost -
        entry.paymentFees,
    }))
    .sort((a, b) => new Date(a.bucket).getTime() - new Date(b.bucket).getTime());

  const totalRevenue = series.reduce((sum, r) => sum + r.revenue, 0);
  const totalCosts = series.reduce(
    (sum, r) => sum + r.referralCost + r.ibCost + r.affiliateCost + r.paymentFees,
    0,
  );
  const totalNet = totalRevenue - totalCosts;

  return {
    range: { from: fromDate, to: toDate },
    total: totalNet,
    grossRevenue: totalRevenue,
    totalCosts,
    series,
  };
}

export const netRevenueService = {
  getNetRevenue,
};