/**
 * Job Metrics
 *
 * In-process counters and timings for jobs. Exposed through the
 * metrics module for Prometheus or the admin health endpoint.
 *
 * @module server/jobs/job-metrics
 */

const METRICS = {
  processed: 0,
  succeeded: 0,
  failed: 0,
  retried: 0,
  deadLettered: 0,
  byType: new Map(),
  durations: new Map(),
};

export function recordJobProcessed({ jobType, durationMs, success }) {
  METRICS.processed++;

  if (success) {
    METRICS.succeeded++;
  } else {
    METRICS.failed++;
  }

  const typeStats = METRICS.byType.get(jobType) || { processed: 0, succeeded: 0, failed: 0 };
  typeStats.processed++;
  if (success) {
    typeStats.succeeded++;
  } else {
    typeStats.failed++;
  }
  METRICS.byType.set(jobType, typeStats);

  if (typeof durationMs === 'number') {
    const list = METRICS.durations.get(jobType) || [];
    list.push(durationMs);
    if (list.length > 200) {
      list.shift();
    }
    METRICS.durations.set(jobType, list);
  }
}

export function recordJobRetry({ jobType }) {
  METRICS.retried++;
  const typeStats = METRICS.byType.get(jobType) || { processed: 0, succeeded: 0, failed: 0 };
  typeStats.retried = (typeStats.retried || 0) + 1;
  METRICS.byType.set(jobType, typeStats);
}

export function recordJobDeadLetter({ jobType }) {
  METRICS.deadLettered++;
  const typeStats = METRICS.byType.get(jobType) || { processed: 0, succeeded: 0, failed: 0 };
  typeStats.deadLettered = (typeStats.deadLettered || 0) + 1;
  METRICS.byType.set(jobType, typeStats);
}

function computeAverage(list) {
  if (!Array.isArray(list) || list.length === 0) {
    return null;
  }
  const total = list.reduce((sum, v) => sum + v, 0);
  return total / list.length;
}

export function getJobMetrics() {
  const byType = Array.from(METRICS.byType.entries()).map(([jobType, stats]) => ({
    jobType,
    ...stats,
    averageDurationMs: computeAverage(METRICS.durations.get(jobType) || []),
  }));

  return {
    processed: METRICS.processed,
    succeeded: METRICS.succeeded,
    failed: METRICS.failed,
    retried: METRICS.retried,
    deadLettered: METRICS.deadLettered,
    byType,
  };
}

export function resetJobMetrics() {
  METRICS.processed = 0;
  METRICS.succeeded = 0;
  METRICS.failed = 0;
  METRICS.retried = 0;
  METRICS.deadLettered = 0;
  METRICS.byType.clear();
  METRICS.durations.clear();
}

export const jobMetrics = {
  recordJobProcessed,
  recordJobRetry,
  recordJobDeadLetter,
  getJobMetrics,
  resetJobMetrics,
};