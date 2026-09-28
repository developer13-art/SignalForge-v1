/**
 * Compliance Report Repository
 *
 * Aggregated queries for the compliance reporting subsystem.
 *
 * @module server/modules/compliance/reports/compliance-report.repository
 */

import { db } from '../../../database';

export async function kycStatusSeries({ from, to, granularity = 'day' }) {
  const dateTrunc = granularity === 'month' ? 'month' : granularity === 'week' ? 'week' : 'day';

  const { rows } = await db.query(
    `SELECT DATE_TRUNC($1, created_at) AS bucket,
            COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE status = 'VERIFIED')::int AS approved,
            COUNT(*) FILTER (WHERE status = 'REJECTED')::int AS rejected,
            COUNT(*) FILTER (WHERE status = 'UNDER_REVIEW')::int AS under_review
       FROM kyc_applications
      WHERE created_at >= $2 AND created_at <= $3
      GROUP BY bucket
      ORDER BY bucket ASC`,
    [dateTrunc, from, to],
  );

  return rows.map((row) => ({
    bucket: row.bucket,
    total: row.total,
    approved: row.approved,
    rejected: row.rejected,
    underReview: row.under_review,
  }));
}

export async function approvalRateSummary({ from, to }) {
  const { rows } = await db.query(
    `SELECT
       COUNT(*)::int AS total,
       COUNT(*) FILTER (WHERE status = 'VERIFIED')::int AS approved,
       COUNT(*) FILTER (WHERE status = 'REJECTED')::int AS rejected,
       COUNT(*) FILTER (WHERE status = 'UNDER_REVIEW')::int AS pending,
       AVG(EXTRACT(EPOCH FROM (verified_at - submitted_at)) / 60)::numeric AS avg_review_minutes
       FROM kyc_applications
      WHERE created_at >= $1 AND created_at <= $2`,
    [from, to],
  );

  const row = rows[0] || {};

  const total = row.total || 0;
  const approved = row.approved || 0;
  const approvalRate = total > 0 ? approved / total : 0;

  return {
    total,
    approved,
    rejected: row.rejected || 0,
    pending: row.pending || 0,
    approvalRate,
    avgReviewMinutes: Number(row.avg_review_minutes || 0),
  };
}

export async function riskFlagSummary({ from, to }) {
  const { rows } = await db.query(
    `SELECT flag_type, severity, COUNT(*)::int AS count
       FROM kyc_risk_flags
      WHERE created_at >= $1 AND created_at <= $2
      GROUP BY flag_type, severity
      ORDER BY count DESC`,
    [from, to],
  );

  return rows.map((row) => ({
    flagType: row.flag_type,
    severity: row.severity,
    count: row.count,
  }));
}

export async function reviewerPerformanceSummary({ from, to }) {
  const { rows } = await db.query(
    `SELECT reviewer_id,
            COUNT(*)::int AS reviewed_count,
            COUNT(*) FILTER (WHERE status = 'VERIFIED')::int AS approved_count,
            COUNT(*) FILTER (WHERE status = 'REJECTED')::int AS rejected_count,
            AVG(EXTRACT(EPOCH FROM (reviewed_at - submitted_at)) / 60)::numeric AS avg_review_minutes
       FROM kyc_applications
      WHERE reviewed_at >= $1 AND reviewed_at <= $2 AND reviewer_id IS NOT NULL
      GROUP BY reviewer_id
      ORDER BY reviewed_count DESC`,
    [from, to],
  );

  return rows.map((row) => ({
    reviewerId: row.reviewer_id,
    reviewedCount: row.reviewed_count,
    approvedCount: row.approved_count,
    rejectedCount: row.rejected_count,
    avgReviewMinutes: Number(row.avg_review_minutes || 0),
  }));
}

export async function documentTypeUsageSummary({ from, to }) {
  const { rows } = await db.query(
    `SELECT document_type, COUNT(*)::int AS count
       FROM kyc_documents
      WHERE uploaded_at >= $1 AND uploaded_at <= $2
      GROUP BY document_type
      ORDER BY count DESC`,
    [from, to],
  );

  return rows.map((row) => ({
    documentType: row.document_type,
    count: row.count,
  }));
}

export const complianceReportRepository = {
  kycStatusSeries,
  approvalRateSummary,
  riskFlagSummary,
  reviewerPerformanceSummary,
  documentTypeUsageSummary,
};