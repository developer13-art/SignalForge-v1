/**
 * Job Runner
 *
 * Long-running in-process loop that polls the job queue, dispatches
 * jobs to registered handlers, updates status, and handles retries.
 * Started during bootstrap and stopped during shutdown.
 *
 * @module server/jobs/job-runner
 */

import os from 'node:os';
import crypto from 'node:crypto';
import { logger } from '../lib/logger';
import { sleep } from '@signalforge/shared/utils/sleep.util';
import { jobRepository } from './job.repository';
import { jobRegistry } from './job-registry';
import { jobMetrics } from './job-metrics';
import { jobLogger } from './job-logger';

const DEFAULT_POLL_INTERVAL_MS = 500;
const DEFAULT_CONCURRENCY = 5;
const WORKER_ID = `${os.hostname()}-${process.pid}-${crypto.randomBytes(4).toString('hex')}`;

let running = false;
let pollTimer = null;
let activeWorkers = 0;
let loopInProgress = false;

async function executeJob({ job }) {
  const handler = jobRegistry.getJobHandler({ jobType: job.job_type });

  if (!handler) {
    await jobRepository.failJob({
      jobId: job.id,
      error: `No handler registered for job type: ${job.job_type}`,
      retry: false,
    });

    jobLogger.logJobDeadLetter({
      jobId: job.id,
      jobType: job.job_type,
      attempts: job.attempts,
      error: 'HANDLER_NOT_FOUND',
    });

    jobMetrics.recordJobDeadLetter({ jobType: job.job_type });
    return;
  }

  const start = Date.now();

  jobLogger.logJobStart({ jobId: job.id, jobType: job.job_type, workerId: WORKER_ID });

  let payload = null;
  try {
    payload = job.payload ? JSON.parse(job.payload) : null;
  } catch (err) {
    logger.warn({ err, jobId: job.id }, 'Failed to parse job payload');
  }

  try {
    await handler(payload, {
      jobId: job.id,
      jobType: job.job_type,
      attempt: job.attempts,
      workerId: WORKER_ID,
    });

    const duration = Date.now() - start;

    await jobRepository.completeJob({ jobId: job.id });
    jobMetrics.recordJobProcessed({ jobType: job.job_type, durationMs: duration, success: true });
    jobLogger.logJobSuccess({ jobId: job.id, jobType: job.job_type, durationMs: duration });
  } catch (err) {
    const duration = Date.now() - start;

    const failure = await jobRepository.failJob({
      jobId: job.id,
      error: err.message,
      retry: true,
    });

    jobMetrics.recordJobProcessed({ jobType: job.job_type, durationMs: duration, success: false });
    jobLogger.logJobFailure({
      jobId: job.id,
      jobType: job.job_type,
      durationMs: duration,
      error: err,
      attempt: job.attempts,
      maxAttempts: job.max_attempts,
    });

    if (failure.retrying) {
      jobMetrics.recordJobRetry({ jobType: job.job_type });
      jobLogger.logJobRetry({
        jobId: job.id,
        jobType: job.job_type,
        attempt: job.attempts,
        maxAttempts: job.max_attempts,
        delaySeconds: failure.delaySeconds,
      });
    } else if (failure.deadLetter) {
      jobMetrics.recordJobDeadLetter({ jobType: job.job_type });
      jobLogger.logJobDeadLetter({
        jobId: job.id,
        jobType: job.job_type,
        attempts: job.attempts,
        error: err,
      });
    }
  }
}

async function pullAndExecute() {
  if (!running || loopInProgress) {
    return;
  }

  loopInProgress = true;

  try {
    while (running && activeWorkers < DEFAULT_CONCURRENCY) {
      const job = await jobRepository.lockNextJob({ workerId: WORKER_ID });

      if (!job) {
        break;
      }

      activeWorkers++;

      executeJob({ job })
        .catch((err) => logger.error({ err, jobId: job.id }, 'Job execution threw'))
        .finally(() => {
          activeWorkers--;
        });
    }
  } catch (err) {
    logger.error({ err }, 'Job runner loop failed');
  } finally {
    loopInProgress = false;
  }
}

export async function startJobRunner({ pollIntervalMs = DEFAULT_POLL_INTERVAL_MS } = {}) {
  if (running) {
    return { running: true, alreadyRunning: true };
  }

  running = true;

  logger.info({ workerId: WORKER_ID, pollIntervalMs }, 'Job runner started');

  const loop = async () => {
    if (!running) {
      return;
    }

    await pullAndExecute();

    if (running) {
      pollTimer = setTimeout(loop, pollIntervalMs);
    }
  };

  pollTimer = setTimeout(loop, 0);

  return { running: true, workerId: WORKER_ID };
}

export async function stopJobRunner({ drainMs = 15000 } = {}) {
  if (!running) {
    return { running: false };
  }

  running = false;

  if (pollTimer) {
    clearTimeout(pollTimer);
    pollTimer = null;
  }

  const start = Date.now();

  while (activeWorkers > 0 && Date.now() - start < drainMs) {
    await sleep(250);
  }

  logger.info({ activeWorkersRemaining: activeWorkers }, 'Job runner stopped');

  return { running: false, activeWorkersRemaining: activeWorkers };
}

export function isJobRunnerRunning() {
  return running;
}

export function getJobRunnerStatus() {
  return {
    running,
    workerId: WORKER_ID,
    activeWorkers,
    concurrency: DEFAULT_CONCURRENCY,
  };
}

export const jobRunner = {
  startJobRunner,
  stopJobRunner,
  isJobRunnerRunning,
  getJobRunnerStatus,
};