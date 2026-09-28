/**
 * Real-time Jobs Schedule
 *
 * @module server/jobs/schedules/real-time-jobs.schedule
 */

import { logger } from '../../lib/logger';

export async function runScheduledJobs({ enqueueJob }) {
  const jobs = [
    { jobType: 'INDEX_SOLANA_EVENTS', payload: {} },
    { jobType: 'VERIFY_SOLANA_PAYMENT', payload: {} },
  ];

  const results = [];

  for (const job of jobs) {
    try {
      const result = await enqueueJob(job);
      results.push(result);
    } catch (err) {
      logger.warn({ err, jobType: job.jobType }, 'Failed to enqueue realtime job');
    }
  }

  return { executed: true, enqueued: results.length };
}