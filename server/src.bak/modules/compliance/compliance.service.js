/**
 * Compliance Service
 *
 * Top-level orchestration for compliance operations. Delegates to
 * specialized services for the KYC queue, review decisions, document
 * types, verification providers, risk flags, audit, and reports.
 *
 * @module server/modules/compliance/compliance.service
 */

import { AppError } from '../../lib/errors/app-error';
import { ERROR_CODES } from '../../lib/errors/error-codes';
import { kycQueueService } from './kyc-queue/kyc-queue.service';
import { reviewService } from './review/review.service';
import { documentTypeService } from './document-types/document-type.service';
import { verificationProviderService } from './verification-providers/verification-provider.service';
import { riskFlagService } from './risk-flags/risk-flag.service';
import { complianceAuditService } from './audit/compliance-audit.service';
import { complianceReportService } from './reports/compliance-report.service';
import * as repository from './compliance.repository';

export async function getComplianceDashboard({ since }) {
  const [statusCounts, openRiskFlags] = await Promise.all([
    repository.countKycApplicationsByStatus(),
    repository.countOpenRiskFlags(),
  ]);

  const slaBreaches = await repository.findApplicationsExceedingSla({ hours: 48, limit: 1000 });

  const statusBreakdown = {};
  let total = 0;
  for (const row of statusCounts) {
    statusBreakdown[row.status] = row.count;
    total += row.count;
  }

  return {
    since: since || null,
    statusBreakdown,
    totalApplications: total,
    openRiskFlags,
    slaBreachCount: slaBreaches.length,
  };
}

export async function getSlaBreaches({ hours = 48, limit = 100 }) {
  const rows = await repository.findApplicationsExceedingSla({ hours, limit });

  return rows.map((row) => ({
    applicationId: row.id,
    userId: row.user_id,
    status: row.status,
    submittedAt: row.submitted_at,
  }));
}

export async function recordComplianceAction({
  actorId,
  action,
  resourceType,
  resourceId,
  oldValue,
  newValue,
  reason,
}) {
  if (!actorId || !action) {
    throw new AppError('actorId and action are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const log = await repository.insertAuditLog({
    actorId,
    action,
    resourceType,
    resourceId,
    oldValue,
    newValue,
    reason,
  });

  return {
    auditLogId: log.id,
    action,
    resourceType,
    resourceId,
  };
}

export async function assertReviewerAccess({ userId }) {
  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const { rows } = await import('../../database').then((m) =>
    m.db.query(
      `SELECT r.name AS role_name
         FROM user_roles ur
         JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = $1`,
      [userId],
    ),
  );

  const roleNames = rows.map((r) => r.role_name);

  const allowed = ['COMPLIANCE_OFFICER', 'ADMIN', 'SUPER_ADMIN'];

  if (!roleNames.some((r) => allowed.includes(r))) {
    throw new AppError('Compliance reviewer access required', ERROR_CODES.AUTHORIZATION_FAILED, 403);
  }

  return { roleNames };
}

export const complianceService = {
  getComplianceDashboard,
  getSlaBreaches,
  recordComplianceAction,
  assertReviewerAccess,

  queue: kycQueueService,
  review: reviewService,
  documentTypes: documentTypeService,
  verificationProviders: verificationProviderService,
  riskFlags: riskFlagService,
  audit: complianceAuditService,
  reports: complianceReportService,
};