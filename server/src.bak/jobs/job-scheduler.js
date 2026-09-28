/**
 * Job Scheduler
 *
 * Loads cron-like schedules and enqueues recurring jobs. Runs on a
 * simple polling loop so no external cron system is required.
 *
 * @module server/jobs/job-scheduler
 */

import { logger } from '../lib/logger';
import { jobQueue } from './job-queue';
import { jobLogger } from './job-logger';
import * as dailySchedule from './schedules/daily-jobs.schedule';
import * as hourlySchedule from './schedules/hourly-jobs.schedule';
import * as monthlySchedule from './schedules/monthly-jobs.schedule';
import * as realtimeSchedule from './schedules/real-time-jobs.schedule';

const DEFAULT_TICK_INTERVAL_MS = 60 * 1000;

let running = false;
let tickTimer = null;

const ALL_SCHEDULES = [
  { name: 'realtime', module: realtimeSchedule, intervalMs: 10 * 1000 },
  { name: 'hourly', module: hourlySchedule, intervalMs: 60 * 60 * 1000 },
  { name: 'daily', module: dailySchedule, intervalMs: 24 * 60 * 60 * 1000 },
  { name: 'monthly', module: monthlySchedule, intervalMs: 30 * 24 * 60 * 60 * 1000 },
];

const LAST_RUN = new Map();

async function runSchedule({ schedule, now }) {
  const lastRun = LAST_RUN.get(schedule.name) || 0;

  if (now - lastRun < schedule.intervalMs) {
    return { executed: false, reason: 'NOT_DUE' };
  }

  if (typeof schedule.module.runScheduledJobs !== 'function') {
    return { executed: false, reason: 'NO_RUN_FUNCTION' };
  }

  try {
    const result = await schedule.module.runScheduledJobs({ enqueueJob: jobQueue.enqueueJob });
    LAST_RUN.set(schedule.name, now);
    return { executed: true, result };
  } catch (err) {
    logger.error({ err, schedule: schedule.name }, 'Schedule execution failed');
    return { executed: false, error: err.message };
  }
}

async function tick() {
  if (!running) {
    return;
  }

  const now = Date.now();

  try {
    for (const schedule of ALL_SCHEDULES) {
      await runSchedule({ schedule, now });
    }

    const pendingCount = 0;

    jobLogger.logSchedulerTick({ scheduledCount: ALL_SCHEDULES.length, pendingCount });
  } catch (err) {
    logger.error({ err }, 'Scheduler tick failed');
  }
}

export async function startScheduler({ tickIntervalMs = DEFAULT_TICK_INTERVAL_MS } = {}) {
  if (running) {
    return { running: true, alreadyRunning: true };
  }

  running = true;

  logger.info({ tickIntervalMs }, 'Job scheduler started');

  const loop = async () => {
    if (!running) {
      return;
    }

    await tick();

    if (running) {
      tickTimer = setTimeout(loop, tickIntervalMs);
    }
  };

  tickTimer = setTimeout(loop, 0);

  return { running: true };
}

export async function stopScheduler() {
  if (!running) {
    return { running: false };
  }

  running = false;

  if (tickTimer) {
    clearTimeout(tickTimer);
    tickTimer = null;
  }

  logger.info('Job scheduler stopped');

  return { running: false };
}

export function isSchedulerRunning() {
  return running;
}

export const jobScheduler = {
  startScheduler,
  stopScheduler,
  isSchedulerRunning,
};