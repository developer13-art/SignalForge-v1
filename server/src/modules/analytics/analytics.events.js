/**
 * Analytics Event Helpers
 *
 * @module signalforge/server/modules/analytics/events
 */

import { getEventBus } from '../../bootstrap/initEventBus.js';
import { ANALYTICS_EVENTS } from './analytics.constants.js';

function publish(eventType, payload, options = {}) {
  const bus = getEventBus();
  return bus.publish(eventType, payload, {
    source: 'analytics',
    sourceVersion: '1.0.0',
    ...options,
  });
}

export function emitMetricCalculated(userId, metricType, value, meta = {}) {
  return publish(ANALYTICS_EVENTS.METRIC_CALCULATED, {
    userId,
    metricType,
    value,
    calculatedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitMetricsBatchCalculated(userId, metricTypes, meta = {}) {
  return publish(ANALYTICS_EVENTS.METRICS_BATCH_CALCULATED, {
    userId,
    metricTypes,
    calculatedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitReportRequested(userId, reportId, reportType, meta = {}) {
  return publish(ANALYTICS_EVENTS.REPORT_REQUESTED, {
    userId,
    reportId,
    reportType,
    requestedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitReportGenerated(userId, reportId, meta = {}) {
  return publish(ANALYTICS_EVENTS.REPORT_GENERATED, {
    userId,
    reportId,
    generatedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitReportFailed(userId, reportId, error, meta = {}) {
  return publish(ANALYTICS_EVENTS.REPORT_FAILED, {
    userId,
    reportId,
    error: typeof error === 'string' ? error : error.message,
    failedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitReportExported(userId, reportId, format, meta = {}) {
  return publish(ANALYTICS_EVENTS.REPORT_EXPORTED, {
    userId,
    reportId,
    format,
    exportedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitReportScheduled(userId, reportType, cron, meta = {}) {
  return publish(ANALYTICS_EVENTS.REPORT_SCHEDULED, {
    userId,
    reportType,
    cron,
    scheduledAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitCacheInvalidated(userId, metricType, meta = {}) {
  return publish(ANALYTICS_EVENTS.CACHE_INVALIDATED, {
    userId,
    metricType,
    invalidatedAt: new Date().toISOString(),
    ...meta,
  });
}

export { ANALYTICS_EVENTS };