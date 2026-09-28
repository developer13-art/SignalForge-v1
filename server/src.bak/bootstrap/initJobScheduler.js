/**
 * Job Scheduler Initialization
 *
 * Initializes the platform job scheduler. The scheduler maintains a
 * list of registered recurring job definitions and inserts job rows
 * into the `jobs` table when they come due. The actual processing is
 * handled by the job runner.
 *
 * Because SignalForge does not use Redis or a dedicated queue, the
 * scheduler runs in-process and relies on PostgreSQL advisory locks
 * to prevent duplicate scheduling across instances.
 *
 * @module signalforge/server/bootstrap/initJobScheduler
 */

import { getLogger } from './initLogger.js';

const DEFAULT_TICK_INTERVAL_MS = 30000;
const SCHEDULER_LOCK_ID = 9002;

let schedulerState = null;

export async function initJobScheduler(dependencies = {}) {
  const logger = getLogger('job-scheduler');

  if (schedulerState) {
    logger.warn('Job scheduler already initialized');
    return schedulerState;
  }

  const db = dependencies.db;
  if (!db || typeof db.advisoryLock !== 'function') {
    throw new Error('initJobScheduler requires a database dependency');
  }

  const registrations = new Map();
  let intervalHandle = null;
  let running = false;

  function register(def) {
    if (!def || typeof def.name !== 'string') {
      throw new Error('Job schedule must have a name');
    }
    if (typeof def.intervalMs !== 'number' || def.intervalMs < 1000) {
      throw new Error(`Job schedule ${def.name} must have intervalMs >= 1000`);
    }
    if (typeof def.jobType !== 'string') {
      throw new Error(`Job schedule ${def.name} must specify a jobType`);
    }
    registrations.set(def.name, {
      name: def.name,
      jobType: def.jobType,
      intervalMs: def.intervalMs,
      enabled: def.enabled !== false,
      payload: def.payload || {},
      lastRunAt: 0,
      cron: def.cron || null,
    });
    logger.debug({ schedule: def.name, intervalMs: def.intervalMs }, 'Job schedule registered');
  }

  function unregister(name) {
    registrations.delete(name);
  }

  async function tick() {
    if (running) {
      return;
    }
    running = true;
    const now = Date.now();

    try {
      for (const schedule of registrations.values()) {
        if (!schedule.enabled) {
          continue;
        }
        const due = now - schedule.lastRunAt >= schedule.intervalMs;
        if (!due) {
          continue;
        }

        schedule.lastRunAt = now;

        try {
          await db.advisoryLock(SCHEDULER_LOCK_ID, async (client) => {
            const insertResult = await client.query(
              `
                INSERT INTO jobs (job_type, payload, status, max_attempts, scheduled_for)
                SELECT $1, $2, 'PENDING', 3, NOW()
                WHERE NOT EXISTS (
                  SELECT 1 FROM jobs
                  WHERE job_type = $1
                    AND status IN ('PENDING', 'SCHEDULED', 'RUNNING', 'RETRYING')
                    AND created_at > NOW() - ($3::int * interval '1 millisecond')
                )
                RETURNING id
              `,
              [schedule.jobType, schedule.payload, schedule.intervalMs],
            );

            if (insertResult.rowCount > 0) {
              logger.debug({ schedule: schedule.name }, 'Scheduled job inserted');
            } else {
              logger.trace({ schedule: schedule.name }, 'Duplicate schedule skipped');
            }
          });
        } catch (error) {
          logger.error({ err: error, schedule: schedule.name }, 'Failed to schedule job');
        }
      }
    } finally {
      running = false;
    }
  }

  intervalHandle = setInterval(tick, DEFAULT_TICK_INTERVAL_MS);
  if (intervalHandle.unref) {
    intervalHandle.unref();
  }

  setImmediate(() => {
    tick().catch((error) => {
      logger.error({ err: error }, 'Initial scheduler tick failed');
    });
  });

  async function close() {
    if (intervalHandle) {
      clearInterval(intervalHandle);
      intervalHandle = null;
    }
    registrations.clear();
    schedulerState = null;
  }

  schedulerState = {
    register,
    unregister,
    close,
    tick,
    get schedules() {
      return Array.from(registrations.values());
    },
  };

  logger.info('Job scheduler initialized');

  return schedulerState;
}

export function getJobScheduler() {
  if (!schedulerState) {
    throw new Error('Job scheduler has not been initialized');
  }
  return schedulerState;
}

export default initJobScheduler;