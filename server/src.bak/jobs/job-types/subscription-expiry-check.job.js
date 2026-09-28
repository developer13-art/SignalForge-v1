/**
 * Subscription Expiry Check Job
 *
 * @module server/jobs/job-types/subscription-expiry-check.job
 */

import { registerJobHandler } from '../job-registry';
import { logger } from '../../lib/logger';
import { db } from '../../database';

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

export function registerSubscriptionExpiryCheckJob() {
  registerJobHandler({
    jobType: 'SUBSCRIPTION_EXPIRY_CHECK',
    handler,
  });
}

export default handler;