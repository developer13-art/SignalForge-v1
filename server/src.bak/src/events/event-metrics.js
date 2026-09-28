/**
 * Event Metrics
 *
 * Tracks counters and timings for published events and handler
 * executions. Metrics are exposed through the metrics module and the
 * admin console.
 *
 * @module server/events/event-metrics
 */
const { logger } = require('../lib/logger');

const METRICS = {
  published: new Map(),
  handled: new Map(),
  failed: new Map(),
  durations: new Map(),
  totalPublished: 0,
  totalHandled: 0,
  totalFailed: 0,
};
function recordEventPublish({ eventType, durationMs }) {
  if (!eventType) {
    return;
  }

  METRICS.published.set(eventType, (METRICS.published.get(eventType) || 0) + 1);
  METRICS.totalPublished++;

  if (typeof durationMs === 'number') {
    const list = METRICS.durations.get(eventType) || [];
    list.push(durationMs);
    if (list.length > 500) {
      list.shift();
    }
    METRICS.durations.set(eventType, list);
  }
}
function recordEventHandler({ eventType, durationMs }) {
  if (!eventType) {
    return;
  }

  METRICS.handled.set(eventType, (METRICS.handled.get(eventType) || 0) + 1);
  METRICS.totalHandled++;

  if (typeof durationMs === 'number') {
    const list = METRICS.durations.get(`handled:${eventType}`) || [];
    list.push(durationMs);
    if (list.length > 500) {
      list.shift();
    }
    METRICS.durations.set(`handled:${eventType}`, list);
  }
}
function recordEventFailure({ eventType, error }) {
  if (!eventType) {
    return;
  }

  METRICS.failed.set(eventType, (METRICS.failed.get(eventType) || 0) + 1);
  METRICS.totalFailed++;

  logger.debug({ eventType, error: error ? error.message : null }, 'Event handler failure recorded');
}

function computeAverageDuration(list) {
  if (!Array.isArray(list) || list.length === 0) {
    return null;
  }
  const total = list.reduce((sum, v) => sum + v, 0);
  return total / list.length;
}
function getEventMetrics() {
  const published = Array.from(METRICS.published.entries()).map(([eventType, count]) => ({
    eventType,
    count,
    handled: METRICS.handled.get(eventType) || 0,
    failed: METRICS.failed.get(eventType) || 0,
    averageDurationMs: computeAverageDuration(METRICS.durations.get(eventType) || []),
  }));

  return {
    totalPublished: METRICS.totalPublished,
    totalHandled: METRICS.totalHandled,
    totalFailed: METRICS.totalFailed,
    published,
  };
}
function resetEventMetrics() {
  METRICS.published.clear();
  METRICS.handled.clear();
  METRICS.failed.clear();
  METRICS.durations.clear();
  METRICS.totalPublished = 0;
  METRICS.totalHandled = 0;
  METRICS.totalFailed = 0;
}
const eventMetrics = {
  recordEventPublish,
  recordEventHandler,
  recordEventFailure,
  getEventMetrics,
  resetEventMetrics,
};
module.exports.eventMetrics = eventMetrics;
module.exports.recordEventPublish = recordEventPublish;
module.exports.recordEventHandler = recordEventHandler;
module.exports.recordEventFailure = recordEventFailure;
module.exports.getEventMetrics = getEventMetrics;
module.exports.resetEventMetrics = resetEventMetrics;
