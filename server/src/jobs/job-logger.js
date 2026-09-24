/**
 * Job Logger
 *
 * Structured logging for job lifecycle events. Emits consistent
 * context across the runner, scheduler, and per-job handlers.
 *
 * @module server/jobs/job-logger
 */

import { logger } from '../lib/logger';

export function logJobStart({ jobId, jobType, workerId }) {
  logger.info({ jobId, jobType, workerId }, 'Job started');
}

export function logJobSuccess({ jobId, jobType, durationMs }) {
  logger.info({ jobId, jobType, durationMs }, 'Job completed');
}

export function logJobFailure({ jobId, jobType, durationMs, error, attempt, maxAttempts }) {
  logger.error(
    { jobId, jobType, durationMs, error: error ? error.message : null, attempt, maxAttempts },
    'Job failed',
  );
}

export function logJobRetry({ jobId, jobType, attempt, maxAttempts, delaySeconds }) {
  logger.warn({ jobId, jobType, attempt, maxAttempts, delaySeconds }, 'Job scheduled for retry');
}

export function logJobDeadLetter({ jobId, jobType, attempts, error }) {
  logger.error({ jobId, jobType, attempts, error: error ? error.message : null }, 'Job moved to dead letter');
}

export function logSchedulerTick({ scheduledCount, pendingCount }) {
  logger.debug({ scheduledCount, pendingCount }, 'Scheduler tick');
}

export const jobLogger = {
  logJobStart,
  logJobSuccess,
  logJobFailure,
  logJobRetry,
  logJobDeadLetter,
  logSchedulerTick,
};