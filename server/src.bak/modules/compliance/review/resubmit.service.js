/**
 * Resubmit Service
 *
 * Handles the state transition for requesting a KYC resubmission.
 * Resets the application to a state where the user can upload new
 * documents while preserving the prior rejection context for audit.
 *
 * @module server/modules/compliance/review/resubmit.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { nowIso } from '@signalforge/shared/utils/date.util';
import { db } from '../../../database';

export async function requestResubmission({ applicationId, reviewerId, reason, specificIssues }) {
  if (!applicationId || !reviewerId || !reason) {
    throw new AppError(
      'applicationId, reviewerId, and reason are required',
      ERROR_CODES.VALIDATION_FAILED,
      400,
    );
  }

  const { rows } = await db.query(
    `SELECT id, user_id, status FROM kyc_applications WHERE id = $1 LIMIT 1`,
    [applicationId],
  );

  const application = rows[0];

  if (!application) {
    throw new AppError('KYC application not found', ERROR_CODES.NOT_FOUND, 404);
  }

  const now = nowIso();

  await db.query('BEGIN');

  try {
    await db.query(
      `UPDATE kyc_applications
          SET status = 'REJECTED',
              reviewer_id = $1,
              rejection_reason = $2,
              resubmission_requested_at = $3,
              resubmission_issues = $4,
              reviewed_at = $3,
              updated_at = $3
        WHERE id = $5`,
      [
        reviewerId,
        reason,
        now,
        specificIssues ? JSON.stringify(specificIssues) : null,
        applicationId,
      ],
    );

    await db.query(
      `UPDATE users
          SET kyc_status = 'REJECTED',
              updated_at = $1
        WHERE id = $2`,
      [now, application.user_id],
    );

    await db.query('COMMIT');

    logger.info(
      { applicationId, userId: application.user_id, reviewerId },
      'KYC resubmission requested',
    );

    return { userId: application.user_id };
  } catch (err) {
    await db.query('ROLLBACK');
    logger.error({ err, applicationId }, 'Failed to request KYC resubmission');
    throw new AppError('Failed to request KYC resubmission', ERROR_CODES.INTERNAL_ERROR, 500);
  }
}

export const resubmitService = {
  requestResubmission,
};