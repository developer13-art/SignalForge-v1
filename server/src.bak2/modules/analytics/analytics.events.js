/**
 * Analytics Event Helpers
 *
 * @module signalforge/server/modules/analytics/events
 */
const { getEventBus } = require('../../bootstrap/initEventBus.js');
const { ANALYTICS_EVENTS } = require('./analytics.constants.js');

function publish(eventType, payload, options = {}) {
  const bus = getEventBus();
  return bus.publish(eventType, payload, {
    source: 'analytics',
    sourceVersion: '1.0.0',
    ...options,
  });
}
function emitMetricCalculated(userId, metricType, value, meta = {}) {
  return publish(ANALYTICS_EVENTS.METRIC_CALCULATED, {
    userId,
    metricType,
    value,
    calculatedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitMetricsBatchCalculated(userId, metricTypes, meta = {}) {
  return publish(ANALYTICS_EVENTS.METRICS_BATCH_CALCULATED, {
    userId,
    metricTypes,
    calculatedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitReportRequested(userId, reportId, reportType, meta = {}) {
  return publish(ANALYTICS_EVENTS.REPORT_REQUESTED, {
    userId,
    reportId,
    reportType,
    requestedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitReportGenerated(userId, reportId, meta = {}) {
  return publish(ANALYTICS_EVENTS.REPORT_GENERATED, {
    userId,
    reportId,
    generatedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitReportFailed(userId, reportId, error, meta = {}) {
  return publish(ANALYTICS_EVENTS.REPORT_FAILED, {
    userId,
    reportId,
    error: typeof error === 'string' ? error : error.message,
    failedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitReportExported(userId, reportId, format, meta = {}) {
  return publish(ANALYTICS_EVENTS.REPORT_EXPORTED, {
    userId,
    reportId,
    format,
    exportedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitReportScheduled(userId, reportType, cron, meta = {}) {
  return publish(ANALYTICS_EVENTS.REPORT_SCHEDULED, {
    userId,
    reportType,
    cron,
    scheduledAt: new Date().toISOString(),
    ...meta,
  });
}
function emitCacheInvalidated(userId, metricType, meta = {}) {
  return publish(ANALYTICS_EVENTS.CACHE_INVALIDATED, {
    userId,
    metricType,
    invalidatedAt: new Date().toISOString(),
    ...meta,
  });
}

module.exports.emitMetricCalculated = emitMetricCalculated;
module.exports.emitMetricsBatchCalculated = emitMetricsBatchCalculated;
module.exports.emitReportRequested = emitReportRequested;
module.exports.emitReportGenerated = emitReportGenerated;
module.exports.emitReportFailed = emitReportFailed;
module.exports.emitReportExported = emitReportExported;
module.exports.emitReportScheduled = emitReportScheduled;
module.exports.emitCacheInvalidated = emitCacheInvalidated;
