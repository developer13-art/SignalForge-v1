/**
 * Daily Jobs Schedule
 *
 * @module server/jobs/schedules/daily-jobs.schedule
 */

import { logger } from '../../lib/logger';

export async function runScheduledJobs({ enqueueJob }) {
  const now = new Date();
  const hour = now.getUTCHours();

  if (hour !== 3) {
    return { executed: false, reason: 'NOT_SCHEDULED_HOUR' };
  }

  const jobs = [
    { jobType: 'CALCULATE_PERFORMANCE', payload: { scope: 'ALL_USERS' } },
    { jobType: 'SNAPSHOT_ACCOUNT', payload: { scope: 'ALL_ACCOUNTS' } },
    { jobType: 'KYC_EXPIRY_CHECK', payload: {} },
    { jobType: 'SUBSCRIPTION_EXPIRY_CHECK', payload: {} },
    { jobType: 'GENERATE_ANALYTICS', payload: { scope: 'DAILY' } },
  ];

  const results = [];

  for (const job of jobs) {
    try {
      const result = await enqueueJob(job);
      results.push(result);
    } catch (err) {
      logger.warn({ err, jobType: job.jobType }, 'Failed to enqueue daily job');
    }
  }

  return { executed: true, enqueued: results.length };
}