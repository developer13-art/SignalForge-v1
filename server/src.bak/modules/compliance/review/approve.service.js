/**
 * Approve Service
 *
 * Handles the state transition for approving a KYC application: sets
 * the application status, updates the user's high-level KYC state,
 * and notifies downstream services.
 *
 * @module server/modules/compliance/review/approve.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { nowIso } from '@signalforge/shared/utils/date.util';
import { db } from '../../../database';

export async function approveKyc({ applicationId, reviewerId, notes }) {
  if (!applicationId || !reviewerId) {
    throw new AppError('applicationId and reviewerId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rows } = await db.query(
    `SELECT id, user_id, status FROM kyc_applications WHERE id = $1 LIMIT 1`,
    [applicationId],
  );

  const application = rows[0];

  if (!application) {
    throw new AppError('KYC application not found', ERROR_CODES.NOT_FOUND, 404);
  }

  if (application.status === 'VERIFIED') {
    return { userId: application.user_id, alreadyVerified: true };
  }

  const now = nowIso();

  await db.query('BEGIN');

  try {
    await db.query(
      `UPDATE kyc_applications
          SET status = 'VERIFIED',
              reviewer_id = $1,
              review_notes = COALESCE(review_notes, '') || $2,
              reviewed_at = $3,
              verified_at = $3,
              rejection_reason = NULL,
              updated_at = $3
        WHERE id = $4`,
      [reviewerId, notes ? `\nApproved: ${notes}` : '\nApproved', now, applicationId],
    );

    await db.query(
      `UPDATE users
          SET kyc_status = 'VERIFIED',
              updated_at = $1
        WHERE id = $2`,
      [now, application.user_id],
    );

    await db.query('COMMIT');

    logger.info({ applicationId, userId: application.user_id, reviewerId }, 'KYC application approved');

    return { userId: application.user_id };
  } catch (err) {
    await db.query('ROLLBACK');
    logger.error({ err, applicationId }, 'Failed to approve KYC application');
    throw new AppError('Failed to approve KYC application', ERROR_CODES.INTERNAL_ERROR, 500);
  }
}

export const approveService = {
  approveKyc,
};