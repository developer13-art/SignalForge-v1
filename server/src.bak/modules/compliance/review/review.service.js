/**
 * Review Service
 *
 * Business logic for compliance review decisions. Coordinates the
 * approve/reject/resubmit sub-services and enforces reviewer
 * authorization on every action.
 *
 * @module server/modules/compliance/review/review.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { nowIso } from '@signalforge/shared/utils/date.util';
import { db } from '../../../database';
import { publishEvent } from '../../../events/event-publisher';
import { EVENT_TYPES } from '@signalforge/shared/constants/event-types';
import { complianceService } from '../compliance.service';
import { approveKyc } from './approve.service';
import { rejectKyc } from './reject.service';
import { requestResubmission } from './resubmit.service';

async function loadApplication({ applicationId }) {
  const { rows } = await db.query(
    `SELECT * FROM kyc_applications WHERE id = $1 LIMIT 1`,
    [applicationId],
  );
  return rows[0] || null;
}

async function loadDocuments({ applicationId }) {
  const { rows } = await db.query(
    `SELECT id, document_type, storage_key, uploaded_at
       FROM kyc_documents
      WHERE application_id = $1
      ORDER BY uploaded_at ASC`,
    [applicationId],
  );
  return rows;
}

export async function getApplicationForReview({ applicationId, reviewerId }) {
  if (!applicationId || !reviewerId) {
    throw new AppError('applicationId and reviewerId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  await complianceService.assertReviewerAccess({ userId: reviewerId });

  const application = await loadApplication({ applicationId });

  if (!application) {
    throw new AppError('KYC application not found', ERROR_CODES.NOT_FOUND, 404);
  }

  const documents = await loadDocuments({ applicationId });

  return {
    applicationId: application.id,
    userId: application.user_id,
    status: application.status,
    provider: application.provider,
    providerReference: application.provider_reference,
    riskScore: application.risk_score,
    submittedAt: application.submitted_at,
    reviewerId: application.reviewer_id,
    reviewNotes: application.review_notes,
    rejectionReason: application.rejection_reason,
    documents: documents.map((d) => ({
      documentId: d.id,
      documentType: d.document_type,
      storageKey: d.storage_key,
      uploadedAt: d.uploaded_at,
    })),
  };
}

export async function approveApplication({ applicationId, reviewerId, notes }) {
  const result = await approveKyc({ applicationId, reviewerId, notes });

  await complianceService.recordComplianceAction({
    actorId: reviewerId,
    action: 'KYC_APPROVE',
    resourceType: 'KYC_APPLICATION',
    resourceId: applicationId,
    newValue: { status: 'VERIFIED' },
    reason: notes || null,
  });

  await publishEvent({
    eventType: EVENT_TYPES.KYC_APPROVED,
    source: 'compliance.review',
    actorId: reviewerId,
    payload: {
      applicationId,
      userId: result.userId,
      status: 'VERIFIED',
    },
  }).catch((err) => logger.warn({ err }, 'Failed to publish KYC approved event'));

  logger.info({ applicationId, reviewerId }, 'KYC application approved');

  return { approved: true, applicationId, userId: result.userId };
}

export async function rejectApplication({ applicationId, reviewerId, reason }) {
  if (!reason) {
    throw new AppError('Rejection reason is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const result = await rejectKyc({ applicationId, reviewerId, reason });

  await complianceService.recordComplianceAction({
    actorId: reviewerId,
    action: 'KYC_REJECT',
    resourceType: 'KYC_APPLICATION',
    resourceId: applicationId,
    newValue: { status: 'REJECTED' },
    reason,
  });

  await publishEvent({
    eventType: EVENT_TYPES.KYC_REJECTED,
    source: 'compliance.review',
    actorId: reviewerId,
    payload: {
      applicationId,
      userId: result.userId,
      status: 'REJECTED',
      reason,
    },
  }).catch((err) => logger.warn({ err }, 'Failed to publish KYC rejected event'));

  logger.info({ applicationId, reviewerId, reason }, 'KYC application rejected');

  return { rejected: true, applicationId, userId: result.userId };
}

export async function requestResubmission({ applicationId, reviewerId, reason, specificIssues }) {
  if (!reason) {
    throw new AppError('Resubmission reason is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const result = await requestResubmission({ applicationId, reviewerId, reason, specificIssues });

  await complianceService.recordComplianceAction({
    actorId: reviewerId,
    action: 'KYC_RESUBMIT_REQUEST',
    resourceType: 'KYC_APPLICATION',
    resourceId: applicationId,
    newValue: { status: 'REJECTED', specificIssues },
    reason,
  });

  await publishEvent({
    eventType: EVENT_TYPES.KYC_RESUBMIT_REQUESTED,
    source: 'compliance.review',
    actorId: reviewerId,
    payload: {
      applicationId,
      userId: result.userId,
      reason,
      specificIssues: specificIssues || [],
    },
  }).catch((err) => logger.warn({ err }, 'Failed to publish KYC resubmit event'));

  logger.info({ applicationId, reviewerId }, 'KYC resubmission requested');

  return { resubmissionRequested: true, applicationId, userId: result.userId };
}

export async function suspendApplication({ applicationId, reviewerId, reason }) {
  if (!applicationId || !reviewerId) {
    throw new AppError('applicationId and reviewerId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  await complianceService.assertReviewerAccess({ userId: reviewerId });

  const application = await loadApplication({ applicationId });

  if (!application) {
    throw new AppError('KYC application not found', ERROR_CODES.NOT_FOUND, 404);
  }

  const previous = application.status;

  await db.query(
    `UPDATE kyc_applications
        SET status = 'SUSPENDED',
            review_notes = COALESCE(review_notes, '') || $1,
            updated_at = $2
      WHERE id = $3`,
    [reason ? `\nSuspended: ${reason}` : '\nSuspended', nowIso(), applicationId],
  );

  await db.query(
    `UPDATE users SET kyc_status = 'SUSPENDED', updated_at = $1 WHERE id = $2`,
    [nowIso(), application.user_id],
  );

  await complianceService.recordComplianceAction({
    actorId: reviewerId,
    action: 'KYC_SUSPEND',
    resourceType: 'KYC_APPLICATION',
    resourceId: applicationId,
    oldValue: { status: previous },
    newValue: { status: 'SUSPENDED' },
    reason,
  });

  return { suspended: true };
}

export async function escalateApplication({ applicationId, reviewerId, reason }) {
  if (!applicationId || !reviewerId) {
    throw new AppError('applicationId and reviewerId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  await complianceService.assertReviewerAccess({ userId: reviewerId });

  await db.query(
    `UPDATE kyc_applications
        SET escalated_at = $1,
            escalation_reason = $2,
            updated_at = $1
      WHERE id = $3`,
    [nowIso(), reason || null, applicationId],
  );

  await complianceService.recordComplianceAction({
    actorId: reviewerId,
    action: 'KYC_ESCALATE',
    resourceType: 'KYC_APPLICATION',
    resourceId: applicationId,
    reason,
  });

  logger.info({ applicationId, reviewerId, reason }, 'KYC application escalated');

  return { escalated: true };
}

export const reviewService = {
  getApplicationForReview,
  approveApplication,
  rejectApplication,
  requestResubmission,
  suspendApplication,
  escalateApplication,
};