/**
 * Hourly Jobs Schedule
 *
 * @module server/jobs/schedules/hourly-jobs.schedule
 */

import { logger } from '../../lib/logger';

export async function runScheduledJobs({ enqueueJob }) {
  const now = new Date();
  const minute = now.getUTCMinutes();

  if (minute > 5) {
    return { executed: false, reason: 'NOT_SCHEDULED_MINUTE' };
  }

  const jobs = [
    { jobType: 'SYNC_BROKER_ACCOUNT', payload: { scope: 'ACTIVE_ACCOUNTS' } },
    { jobType: 'SESSION_CLEANUP', payload: {} },
  ];

  const results = [];

  for (const job of jobs) {
    try {
      const result = await enqueueJob(job);
      results.push(result);
    } catch (err) {
      logger.warn({ err, jobType: job.jobType }, 'Failed to enqueue hourly job');
    }
  }

  return { executed: true, enqueued: results.length };
}