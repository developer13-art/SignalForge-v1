/**
 * Subscription Expiry Check Job
 *
 * @module server/jobs/job-types/subscription-expiry-check.job
 */
const { registerJobHandler } = require('../job-registry');
const { logger } = require('../../lib/logger');
const { db } = require('../../database');

async function handler() {
  const { rows } = await db.query(
    `UPDATE subscriptions
        SET status = 'EXPIRED', updated_at = NOW()
      WHERE status IN ('ACTIVE', 'TRIAL', 'PAST_DUE', 'GRACE_PERIOD')
        AND current_period_end IS NOT NULL
        AND current_period_end < NOW()
      RETURNING id`,
  );

  logger.info({ expiredCount: rows.length }, 'Subscription expiry check complete');

  return { expired: rows.length };
}
function registerSubscriptionExpiryCheckJob() {
  registerJobHandler({
    jobType: 'SUBSCRIPTION_EXPIRY_CHECK',
    handler,
  });
}
module.exports = handler;
module.exports.registerSubscriptionExpiryCheckJob = registerSubscriptionExpiryCheckJob;
