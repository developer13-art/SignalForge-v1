/**
 * Job Logger
 *
 * Structured logging for job lifecycle events. Emits consistent
 * context across the runner, scheduler, and per-job handlers.
 *
 * @module server/jobs/job-logger
 */
const { logger } = require('../lib/logger');
function logJobStart({ jobId, jobType, workerId }) {
  logger.info({ jobId, jobType, workerId }, 'Job started');
}
function logJobSuccess({ jobId, jobType, durationMs }) {
  logger.info({ jobId, jobType, durationMs }, 'Job completed');
}
function logJobFailure({ jobId, jobType, durationMs, error, attempt, maxAttempts }) {
  logger.error(
    { jobId, jobType, durationMs, error: error ? error.message : null, attempt, maxAttempts },
    'Job failed',
  );
}
function logJobRetry({ jobId, jobType, attempt, maxAttempts, delaySeconds }) {
  logger.warn({ jobId, jobType, attempt, maxAttempts, delaySeconds }, 'Job scheduled for retry');
}
function logJobDeadLetter({ jobId, jobType, attempts, error }) {
  logger.error({ jobId, jobType, attempts, error: error ? error.message : null }, 'Job moved to dead letter');
}
function logSchedulerTick({ scheduledCount, pendingCount }) {
  logger.debug({ scheduledCount, pendingCount }, 'Scheduler tick');
}
const jobLogger = {
  logJobStart,
  logJobSuccess,
  logJobFailure,
  logJobRetry,
  logJobDeadLetter,
  logSchedulerTick,
};
module.exports.jobLogger = jobLogger;
module.exports.logJobStart = logJobStart;
module.exports.logJobSuccess = logJobSuccess;
module.exports.logJobFailure = logJobFailure;
module.exports.logJobRetry = logJobRetry;
module.exports.logJobDeadLetter = logJobDeadLetter;
module.exports.logSchedulerTick = logSchedulerTick;
