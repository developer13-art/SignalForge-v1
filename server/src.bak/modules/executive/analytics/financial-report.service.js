/**
 * Financial Report Service
 *
 * Generates platform-level financial reports combining revenue,
 * referral cost, IB cost, affiliate cost, and payment fees into a
 * single reporting view.
 *
 * @module server/modules/executive/analytics/financial-report.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { db } from '../../../database';

const VALID_GRANULARITIES = Object.freeze(['day', 'week', 'month']);

function normalizeRange({ from, to }) {
  const toDate = to || new Date().toISOString();
  const fromDate = from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  if (new Date(fromDate).getTime() > new Date(toDate).getTime()) {
    throw new AppError('from must be earlier than to', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  return { from: fromDate, to: toDate };
}

function normalizeGranularity(granularity) {
  const g = granularity || 'day';
  if (!VALID_GRANULARITIES.includes(g)) {
    throw new AppError(`Invalid granularity: ${g}`, ERROR_CODES.VALIDATION_FAILED, 400);
  }
  return g;
}

export async function generateReport({ from, to, granularity }) {
  const range = normalizeRange({ from, to });
  const g = normalizeGranularity(granularity);
  const dateTrunc = g === 'month' ? 'month' : g === 'week' ? 'week' : 'day';

  const { rows: revenueRows } = await db.query(
    `SELECT DATE_TRUNC($1, created_at) AS bucket,
            COALESCE(SUM(amount) FILTER (WHERE status = 'SUCCEEDED'), 0)::numeric AS gross_revenue,
            COALESCE(SUM(processing_fee), 0)::numeric AS payment_fees,
            COUNT(*) FILTER (WHERE status = 'SUCCEEDED')::int AS successful_payments,
            COUNT(*) FILTER (WHERE status = 'FAILED')::int AS failed_payments,
            COUNT(*) FILTER (WHERE status = 'REFUNDED')::int AS refunded_payments
       FROM payments
      WHERE created_at >= $2 AND created_at <= $3
      GROUP BY bucket
      ORDER BY bucket ASC`,
    [dateTrunc, range.from, range.to],
  );

  const { rows: referralRows } = await db.query(
    `SELECT DATE_TRUNC($1, created_at) AS bucket,
            COALESCE(SUM(reward_amount), 0)::numeric AS referral_cost
       FROM referral_rewards
      WHERE created_at >= $2 AND created_at <= $3
      GROUP BY bucket
      ORDER BY bucket ASC`,
    [dateTrunc, range.from, range.to],
  );

  const { rows: ibRows } = await db.query(
    `SELECT DATE_TRUNC($1, created_at) AS bucket,
            COALESCE(SUM(amount), 0)::numeric AS ib_cost
       FROM ib_revenue_entries
      WHERE created_at >= $2 AND created_at <= $3
      GROUP BY bucket
      ORDER BY bucket ASC`,
    [dateTrunc, range.from, range.to],
  );

  const { rows: affiliateRows } = await db.query(
    `SELECT DATE_TRUNC($1, created_at) AS bucket,
            COALESCE(SUM(amount), 0)::numeric AS affiliate_cost
       FROM affiliate_commissions
      WHERE created_at >= $2 AND created_at <= $3
      GROUP BY bucket
      ORDER BY bucket ASC`,
    [dateTrunc, range.from, range.to],
  );

  const map = new Map();

  const ensure = (bucket) => {
    if (!map.has(bucket)) {
      map.set(bucket, {
        bucket,
        grossRevenue: 0,
        paymentFees: 0,
        referralCost: 0,
        ibCost: 0,
        affiliateCost: 0,
        successfulPayments: 0,
        failedPayments: 0,
        refundedPayments: 0,
        totalCosts: 0,
        netRevenue: 0,
      });
    }
    return map.get(bucket);
  };

  for (const row of revenueRows) {
    const e = ensure(row.bucket);
    e.grossRevenue = Number(row.gross_revenue || 0);
    e.paymentFees = Number(row.payment_fees || 0);
    e.successfulPayments = row.successful_payments;
    e.failedPayments = row.failed_payments;
    e.refundedPayments = row.refunded_payments;
  }

  for (const row of referralRows) {
    ensure(row.bucket).referralCost = Number(row.referral_cost || 0);
  }

  for (const row of ibRows) {
    ensure(row.bucket).ibCost = Number(row.ib_cost || 0);
  }

  for (const row of affiliateRows) {
    ensure(row.bucket).affiliateCost = Number(row.affiliate_cost || 0);
  }

  const series = Array.from(map.values())
    .map((entry) => {
      entry.totalCosts =
        entry.paymentFees + entry.referralCost + entry.ibCost + entry.affiliateCost;
      entry.netRevenue = entry.grossRevenue - entry.totalCosts;
      return entry;
    })
    .sort((a, b) => new Date(a.bucket).getTime() - new Date(b.bucket).getTime());

  const totals = series.reduce(
    (acc, entry) => {
      acc.grossRevenue += entry.grossRevenue;
      acc.paymentFees += entry.paymentFees;
      acc.referralCost += entry.referralCost;
      acc.ibCost += entry.ibCost;
      acc.affiliateCost += entry.affiliateCost;
      acc.totalCosts += entry.totalCosts;
      acc.netRevenue += entry.netRevenue;
      acc.successfulPayments += entry.successfulPayments;
      acc.failedPayments += entry.failedPayments;
      acc.refundedPayments += entry.refundedPayments;
      return acc;
    },
    {
      grossRevenue: 0,
      paymentFees: 0,
      referralCost: 0,
      ibCost: 0,
      affiliateCost: 0,
      totalCosts: 0,
      netRevenue: 0,
      successfulPayments: 0,
      failedPayments: 0,
      refundedPayments: 0,
    },
  );

  return {
    range,
    granularity: g,
    totals,
    series,
  };
}

export async function getMonthlySummary({ months = 12 }) {
  const since = new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000).toISOString();

  return generateReport({
    from: since,
    to: new Date().toISOString(),
    granularity: 'month',
  });
}

export const financialReportService = {
  generateReport,
  getMonthlySummary,
};