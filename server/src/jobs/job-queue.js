/**
 * Job Queue
 *
 * High-level facade over the job repository. All services should
 * enqueue work through this module so that priority assignment,
 * batching, and event emission are centralized.
 *
 * @module server/jobs/job-queue
 */
const { logger } = require('../lib/logger');
const { jobRepository } = require('./job.repository');

const DEFAULT_PRIORITIES = Object.freeze({
  SIGNAL_PIPELINE: 80,
  EXECUTION: 90,
  BROKER_SYNC: 60,
  REFERRAL: 30,
  ANALYTICS: 20,
  CLEANUP: 10,
  NOTIFICATION: 50,
});
async function enqueueJob({
  jobType,
  payload,
  priority,
  maxAttempts = 3,
  scheduledAt = null,
}) {
  if (!jobType) {
    throw new Error('jobType is required');
  }

  const record = await jobRepository.insertJob({
    jobType,
    payload,
    priority: priority || DEFAULT_PRIORITIES.SIGNAL_PIPELINE,
    maxAttempts,
    scheduledAt,
  });

  logger.debug({ jobId: record.id, jobType }, 'Job enqueued');

  return {
    jobId: record.id,
    jobType: record.job_type,
    status: record.status,
    scheduledAt: record.scheduled_at,
  };
}
async function enqueueJobBatch(jobs) {
  if (!Array.isArray(jobs) || jobs.length === 0) {
    return { enqueued: 0, jobIds: [] };
  }

  const jobIds = [];

  for (const job of jobs) {
    try {
      const result = await enqueueJob(job);
      jobIds.push(result.jobId);
    } catch (err) {
      logger.warn({ err, jobType: job.jobType }, 'Batch enqueue failed for one job');
    }
  }

  return { enqueued: jobIds.length, jobIds };
}
async function enqueueWithPriority({ jobType, payload, category, maxAttempts }) {
  const priority = DEFAULT_PRIORITIES[category] ?? DEFAULT_PRIORITIES.SIGNAL_PIPELINE;
  return enqueueJob({ jobType, payload, priority, maxAttempts });
}
const jobQueue = {
  enqueueJob,
  enqueueJobBatch,
  enqueueWithPriority,
  DEFAULT_PRIORITIES,
};
module.exports.jobQueue = jobQueue;

module.exports.enqueueJob = enqueueJob;

module.exports.enqueueJobBatch = enqueueJobBatch;

module.exports.enqueueWithPriority = enqueueWithPriority;
