/**
 * KYC Expiry Check Job
 *
 * @module server/jobs/job-types/kyc-expiry-check.job
 */
const { registerJobHandler } = require('../job-registry');
const { logger } = require('../../lib/logger');
const { db } = require('../../database');

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
function registerKycExpiryCheckJob() {
  registerJobHandler({
    jobType: 'KYC_EXPIRY_CHECK',
    handler,
  });
}
module.exports = handler;
module.exports.registerKycExpiryCheckJob = registerKycExpiryCheckJob;
