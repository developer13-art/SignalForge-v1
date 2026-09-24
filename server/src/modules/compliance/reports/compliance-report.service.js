/**
 * Compliance Report Service
 *
 * Aggregates compliance metrics for dashboards and exports. All
 * reports are scoped to a from/to window.
 *
 * @module server/modules/compliance/reports/compliance-report.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { REPORT_EXPORT_FORMATS } from '../../admin/admin.constants';
import * as repository from './compliance-report.repository';

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

export async function generateComplianceReport({ from, to, granularity }) {
  const range = normalizeRange({ from, to });
  const g = normalizeGranularity(granularity);

  const [statusSeries, approvalRate, riskFlags, reviewerPerformance, documentUsage] = await Promise.all([
    repository.kycStatusSeries({ ...range, granularity: g }),
    repository.approvalRateSummary(range),
    repository.riskFlagSummary(range),
    repository.reviewerPerformanceSummary(range),
    repository.documentTypeUsageSummary(range),
  ]);

  return {
    range,
    granularity: g,
    statusSeries,
    approvalRate,
    riskFlags,
    reviewerPerformance,
    documentUsage,
  };
}

export async function generateKycStatusReport({ from, to, granularity }) {
  const range = normalizeRange({ from, to });
  const g = normalizeGranularity(granularity);

  const series = await repository.kycStatusSeries({ ...range, granularity: g });

  return { range, granularity: g, series };
}

export async function generateApprovalRateReport({ from, to }) {
  const range = normalizeRange({ from, to });

  const summary = await repository.approvalRateSummary(range);

  return { range, summary };
}

export async function generateRiskFlagReport({ from, to }) {
  const range = normalizeRange({ from, to });

  const flags = await repository.riskFlagSummary(range);

  return { range, flags };
}

export async function generateReviewerPerformanceReport({ from, to }) {
  const range = normalizeRange({ from, to });

  const reviewers = await repository.reviewerPerformanceSummary(range);

  return { range, reviewers };
}

export async function generateDocumentUsageReport({ from, to }) {
  const range = normalizeRange({ from, to });

  const usage = await repository.documentTypeUsageSummary(range);

  return { range, usage };
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
    case 'COMPLIANCE_SUMMARY': {
      report = await generateComplianceReport({ from, to, granularity });
      return { format, report };
    }
    case 'KYC_STATUS': {
      report = await generateKycStatusReport({ from, to, granularity });
      columns = [
        { key: 'bucket', label: 'Bucket' },
        { key: 'total', label: 'Total' },
        { key: 'approved', label: 'Approved' },
        { key: 'rejected', label: 'Rejected' },
        { key: 'underReview', label: 'Under Review' },
      ];
      break;
    }
    case 'APPROVAL_RATE': {
      report = await generateApprovalRateReport({ from, to });
      columns = [
        { key: 'total', label: 'Total' },
        { key: 'approved', label: 'Approved' },
        { key: 'rejected', label: 'Rejected' },
        { key: 'pending', label: 'Pending' },
        { key: 'approvalRate', label: 'Approval Rate' },
        { key: 'avgReviewMinutes', label: 'Avg Review Minutes' },
      ];
      break;
    }
    case 'RISK_FLAGS': {
      report = await generateRiskFlagReport({ from, to });
      columns = [
        { key: 'flagType', label: 'Flag Type' },
        { key: 'severity', label: 'Severity' },
        { key: 'count', label: 'Count' },
      ];
      break;
    }
    case 'REVIEWER_PERFORMANCE': {
      report = await generateReviewerPerformanceReport({ from, to });
      columns = [
        { key: 'reviewerId', label: 'Reviewer ID' },
        { key: 'reviewedCount', label: 'Reviewed' },
        { key: 'approvedCount', label: 'Approved' },
        { key: 'rejectedCount', label: 'Rejected' },
        { key: 'avgReviewMinutes', label: 'Avg Review Minutes' },
      ];
      break;
    }
    case 'DOCUMENT_USAGE': {
      report = await generateDocumentUsageReport({ from, to });
      columns = [
        { key: 'documentType', label: 'Document Type' },
        { key: 'count', label: 'Count' },
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
    const series = report.series || report.flags || report.reviewers || report.usage || (report.summary ? [report.summary] : []);
    const csv = toCsv(series, columns);
    return { format, csv };
  }

  throw new AppError(`Unsupported export format: ${format}`, ERROR_CODES.VALIDATION_FAILED, 400);
}

export const complianceReportService = {
  generateComplianceReport,
  generateKycStatusReport,
  generateApprovalRateReport,
  generateRiskFlagReport,
  generateReviewerPerformanceReport,
  generateDocumentUsageReport,
  exportReport,
};