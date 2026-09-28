/**
 * KYC Expiry Check Job
 *
 * @module server/jobs/job-types/kyc-expiry-check.job
 */

import { registerJobHandler } from '../job-registry';
import { logger } from '../../lib/logger';
import { db } from '../../database';

async function handler() {
  const { rows } = await db.query(
    `UPDATE kyc_applications
        SET status = 'EXPIRED', updated_at = NOW()
      WHERE status = 'VERIFIED'
        AND expires_at IS NOT NULL
        AND expires_at < NOW()
      RETURNING user_id`,
  );

  for (const row of rows) {
    await db.query(
      `UPDATE users SET kyc_status = 'EXPIRED', updated_at = NOW() WHERE id = $1`,
      [row.user_id],
    );
  }

  logger.info({ expiredCount: rows.length }, 'KYC expiry check complete');

  return { expired: rows.length };
}

export function registerKycExpiryCheckJob() {
  registerJobHandler({
    jobType: 'KYC_EXPIRY_CHECK',
    handler,
  });
}

export default handler;