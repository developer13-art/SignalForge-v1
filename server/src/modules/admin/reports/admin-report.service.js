/**
 * Admin Report Service
 *
 * Aggregates platform reporting data for the admin dashboard and CSV
 * exports. All series are scoped to a from/to window.
 *
 * @module server/modules/admin/reports/admin-report.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { REPORT_EXPORT_FORMATS } from '../admin.constants';
import * as repository from './admin-report.repository';

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

export async function generatePlatformReport({ from, to, granularity }) {
  const range = normalizeRange({ from, to });
  const g = normalizeGranularity(granularity);

  const [userGrowth, providerGrowth, signalActivity, tradeActivity, revenue, referrals, topProviders] =
    await Promise.all([
      repository.userGrowthSeries({ ...range, granularity: g }),
      repository.providerGrowthSeries({ ...range, granularity: g }),
      repository.signalActivitySeries({ ...range, granularity: g }),
      repository.tradeActivitySeries({ ...range, granularity: g }),
      repository.revenueSeries({ ...range, granularity: g }),
      repository.referralSettlementSummary(range),
      repository.topProvidersByRevenue({ ...range, limit: 10 }),
    ]);

  return {
    range,
    granularity: g,
    userGrowth,
    providerGrowth,
    signalActivity,
    tradeActivity,
    revenue,
    referrals,
    topProviders,
  };
}

export async function generateUserGrowthReport({ from, to, granularity }) {
  const range = normalizeRange({ from, to });
  const g = normalizeGranularity(granularity);

  const series = await repository.userGrowthSeries({ ...range, granularity: g });

  return { range, granularity: g, series };
}

export async function generateSignalActivityReport({ from, to, granularity }) {
  const range = normalizeRange({ from, to });
  const g = normalizeGranularity(granularity);

  const series = await repository.signalActivitySeries({ ...range, granularity: g });

  return { range, granularity: g, series };
}

export async function generateTradeActivityReport({ from, to, granularity }) {
  const range = normalizeRange({ from, to });
  const g = normalizeGranularity(granularity);

  const series = await repository.tradeActivitySeries({ ...range, granularity: g });

  return { range, granularity: g, series };
}

export async function generateRevenueReport({ from, to, granularity }) {
  const range = normalizeRange({ from, to });
  const g = normalizeGranularity(granularity);

  const series = await repository.revenueSeries({ ...range, granularity: g });

  return { range, granularity: g, series };
}

export async function generateReferralReport({ from, to }) {
  const range = normalizeRange({ from, to });

  const summary = await repository.referralSettlementSummary(range);

  return { range, summary };
}

function escapeCsvValue(value) {
  if (value === null || value === undefined) {
    return '';
  }
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function toCsv(rows, columns) {
  const header = columns.map((c) => c.label).join(',');
  const body = rows
    .map((row) => columns.map((c) => escapeCsvValue(row[c.key])).join(','))
    .join('\n');
  return `${header}\n${body}`;
}

export async function exportReport({ type, from, to, granularity, format = 'JSON' }) {
  if (!REPORT_EXPORT_FORMATS[format]) {
    throw new AppError(`Unsupported export format: ${format}`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  let report;
  let columns = [];

  switch (type) {
    case 'PLATFORM': {
      report = await generatePlatformReport({ from, to, granularity });
      columns = [
        { key: 'bucket', label: 'Bucket' },
      ];
      return { format, report };
    }
    case 'USER_GROWTH': {
      report = await generateUserGrowthReport({ from, to, granularity });
      columns = [
        { key: 'bucket', label: 'Bucket' },
        { key: 'count', label: 'Users' },
      ];
      break;
    }
    case 'SIGNAL_ACTIVITY': {
      report = await generateSignalActivityReport({ from, to, granularity });
      columns = [
        { key: 'bucket', label: 'Bucket' },
        { key: 'total', label: 'Total' },
        { key: 'executed', label: 'Executed' },
        { key: 'rejected', label: 'Rejected' },
      ];
      break;
    }
    case 'TRADE_ACTIVITY': {
      report = await generateTradeActivityReport({ from, to, granularity });
      columns = [
        { key: 'bucket', label: 'Bucket' },
        { key: 'trades', label: 'Trades' },
        { key: 'winners', label: 'Winners' },
        { key: 'losers', label: 'Losers' },
        { key: 'totalProfit', label: 'Total Profit' },
      ];
      break;
    }
    case 'REVENUE': {
      report = await generateRevenueReport({ from, to, granularity });
      columns = [
        { key: 'bucket', label: 'Bucket' },
        { key: 'revenue', label: 'Revenue' },
        { key: 'successfulPayments', label: 'Successful Payments' },
      ];
      break;
    }
    case 'REFERRAL': {
      report = await generateReferralReport({ from, to });
      columns = [
        { key: 'totalRewards', label: 'Total Rewards' },
        { key: 'totalRewardAmount', label: 'Total Reward Amount' },
        { key: 'settledCount', label: 'Settled' },
        { key: 'pendingCount', label: 'Pending' },
      ];
      break;
    }
    default:
      throw new AppError(`Unsupported report type: ${type}`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (format === 'JSON') {
    return { format, report };
  }

  if (format === 'CSV') {
    const series = report.series || (report.summary ? [report.summary] : []);
    const csv = toCsv(series, columns);
    return { format, csv };
  }

  throw new AppError(`Unsupported export format: ${format}`, ERROR_CODES.VALIDATION_FAILED, 400);
}

export const adminReportService = {
  generatePlatformReport,
  generateUserGrowthReport,
  generateSignalActivityReport,
  generateTradeActivityReport,
  generateRevenueReport,
  generateReferralReport,
  exportReport,
};