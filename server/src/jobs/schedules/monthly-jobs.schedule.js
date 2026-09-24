/**
 * Monthly Jobs Schedule
 *
 * @module server/jobs/schedules/monthly-jobs.schedule
 */

import { logger } from '../../lib/logger';

export async function runScheduledJobs({ enqueueJob }) {
  const now = new Date();
  const day = now.getUTCDate();

  if (day !== 1) {
    return { executed: false, reason: 'NOT_FIRST_OF_MONTH' };
  }

  const previousMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const period = `${previousMonth.getUTCFullYear()}-${String(previousMonth.getUTCMonth() + 1).padStart(2, '0')}`;

  try {
    const result = await enqueueJob({
      jobType: 'MONTHLY_REFERRAL_SETTLEMENT',
      payload: { period },
    });

    return { executed: true, period, jobId: result.jobId };
  } catch (err) {
    logger.warn({ err, period }, 'Failed to enqueue monthly referral settlement');
    return { executed: false, error: err.message };
  }
}