/**
 * Job Runner Initialization
 *
 * Initializes the in-process job runner. The runner polls the `jobs`
 * table using `FOR UPDATE SKIP LOCKED` to safely pick up jobs for
 * processing without a dedicated queue service. Multiple runner
 * instances can run concurrently.
 *
 * @module signalforge/server/bootstrap/initJobRunner
 */

import { getLogger } from './initLogger.js';

const DEFAULT_POLL_INTERVAL_MS = 2000;
const DEFAULT_BATCH_SIZE = 10;
const DEFAULT_CONCURRENCY = 5;
const DEFAULT_JOB_TIMEOUT_MS = 60000;

let runnerState = null;

export async function initJobRunner(dependencies = {}) {
  const logger = getLogger('job-runner');

  if (runnerState) {
    logger.warn('Job runner already initialized');
    return runnerState;
  }

  const db = dependencies.db;
  if (!db || typeof db.query !== 'function') {
    throw new Error('initJobRunner requires a database dependency');
  }

  const handlers = new Map();
  const config = {
    pollIntervalMs:
      Number(dependencies.pollIntervalMs) || DEFAULT_POLL_INTERVAL_MS,
    batchSize: Number(dependencies.batchSize) || DEFAULT_BATCH_SIZE,
    concurrency: Number(dependencies.concurrency) || DEFAULT_CONCURRENCY,
    jobTimeoutMs: Number(dependencies.jobTimeoutMs) || DEFAULT_JOB_TIMEOUT_MS,
  };

  let running = false;
  let stopping = false;
  let intervalHandle = null;
  let activeJobs = 0;
  const inFlight = new Set();

  function register(jobType, handler) {
    if (typeof jobType !== 'string' || typeof handler !== 'function') {
      throw new Error('register requires a jobType and handler function');
    }
    handlers.set(jobType, handler);
    logger.debug({ jobType }, 'Job handler registered');
  }

  function unregister(jobType) {
    handlers.delete(jobType);
  }

  async function claimJobs() {
    return db.transaction(async (client) => {
      const result = await client.query(
        `
          SELECT id, job_type, payload, attempts, max_attempts
          FROM jobs
          WHERE status IN ('PENDING', 'SCHEDULED', 'RETRYING')
            AND scheduled_for <= NOW()
          ORDER BY scheduled_for ASC
          LIMIT $1
          FOR UPDATE SKIP LOCKED
        `,
        [config.batchSize],
      );

      if (result.rows.length === 0) {
        return [];
      }

      const ids = result.rows.map((row) => row.id);

      await client.query(
        `
          UPDATE jobs
          SET status = 'RUNNING',
              started_at = NOW(),
              attempts = attempts + 1,
              updated_at = NOW()
          WHERE id = ANY($1::bigint[])
        `,
        [ids],
      );

      return result.rows;
    });
  }

  async function completeJob(jobId) {
    await db.query(
      `
        UPDATE jobs
        SET status = 'COMPLETED',
            completed_at = NOW(),
            updated_at = NOW()
        WHERE id = $1
      `,
      [jobId],
    );
  }

  async function failJob(jobId, error, attempts, maxAttempts) {
    const isDeadLetter = attempts >= maxAttempts;
    await db.query(
      `
        UPDATE jobs
        SET status = $2,
            error = $3,
            updated_at = NOW(),
            completed_at = CASE WHEN $2 = 'DEAD_LETTER' THEN NOW() ELSE completed_at END
        WHERE id = $1
      `,
      [
        jobId,
        isDeadLetter ? 'DEAD_LETTER' : 'RETRYING',
        truncateError(error),
      ],
    );
  }

  function truncateError(error) {
    const message = error && error.message ? error.message : String(error);
    return message.length > 4000 ? `${message.substring(0, 4000)}...` : message;
  }

  function withTimeout(promise, timeoutMs, label) {
    let timer;
    const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(() => {
        reject(new Error(`${label} exceeded ${timeoutMs}ms`));
      }, timeoutMs);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
  }

  async function processJob(job) {
    const handler = handlers.get(job.job_type);
    const label = `job:${job.id}:${job.job_type}`;

    if (!handler) {
      logger.warn({ jobId: job.id, jobType: job.job_type }, 'No handler registered for job');
      await failJob(job.id, new Error('No handler registered'), job.attempts, job.max_attempts);
      return;
    }

    try {
      await withTimeout(handler(job.payload, job), config.jobTimeoutMs, label);
      await completeJob(job.id);
      logger.debug({ jobId: job.id, jobType: job.job_type }, 'Job completed');
    } catch (error) {
      logger.error(
        { err: error, jobId: job.id, jobType: job.job_type, attempt: job.attempts },
        'Job failed',
      );
      await failJob(job.id, error, job.attempts, job.max_attempts);
    }
  }

  async function tick() {
    if (running || stopping) {
      return;
    }
    running = true;

    try {
      while (!stopping && activeJobs < config.concurrency) {
        const jobs = await claimJobs();
        if (jobs.length === 0) {
          break;
        }

        for (const job of jobs) {
          if (stopping || activeJobs >= config.concurrency) {
            break;
          }
          activeJobs++;
          const promise = processJob(job).finally(() => {
            activeJobs--;
            inFlight.delete(promise);
          });
          inFlight.add(promise);
        }
      }
    } catch (error) {
      logger.error({ err: error }, 'Job runner tick failed');
    } finally {
      running = false;
    }
  }

  intervalHandle = setInterval(tick, config.pollIntervalMs);
  if (intervalHandle.unref) {
    intervalHandle.unref();
  }

  setImmediate(() => {
    tick().catch((error) => {
      logger.error({ err: error }, 'Initial job runner tick failed');
    });
  });

  async function close() {
    stopping = true;
    if (intervalHandle) {
      clearInterval(intervalHandle);
      intervalHandle = null;
    }
    await Promise.allSettled(Array.from(inFlight));
    runnerState = null;
  }

  runnerState = {
    register,
    unregister,
    close,
    tick,
    get stats() {
      return {
        activeJobs,
        registeredHandlers: handlers.size,
      };
    },
  };

  logger.info(
    {
      pollIntervalMs: config.pollIntervalMs,
      concurrency: config.concurrency,
    },
    'Job runner initialized',
  );

  return runnerState;
}

export function getJobRunner() {
  if (!runnerState) {
    throw new Error('Job runner has not been initialized');
  }
  return runnerState;
}

export default initJobRunner;