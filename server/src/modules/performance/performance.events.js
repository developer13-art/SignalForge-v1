/**
 * Performance Event Helpers
 *
 * @module signalforge/server/modules/performance/events
 */

import { getEventBus } from '../../bootstrap/initEventBus.js';
import { PERFORMANCE_EVENTS } from './performance.constants.js';

function publish(eventType, payload, options = {}) {
  const bus = getEventBus();
  return bus.publish(eventType, payload, {
    source: 'performance',
    sourceVersion: '1.0.0',
    ...options,
  });
}

export function emitPeriodOpened(userId, periodId, settlementPeriod, meta = {}) {
  return publish(PERFORMANCE_EVENTS.PERIOD_OPENED, {
    userId,
    periodId,
    settlementPeriod,
    openedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitPeriodUpdated(userId, periodId, changes, meta = {}) {
  return publish(PERFORMANCE_EVENTS.PERIOD_UPDATED, {
    userId,
    periodId,
    changes,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitPeriodFrozen(userId, periodId, meta = {}) {
  return publish(PERFORMANCE_EVENTS.PERIOD_FROZEN, {
    userId,
    periodId,
    frozenAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitPeriodClosed(userId, periodId, summary, meta = {}) {
  return publish(PERFORMANCE_EVENTS.PERIOD_CLOSED, {
    userId,
    periodId,
    summary,
    closedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitMetricCalculated(userId, periodId, metricType, value, meta = {}) {
  return publish(PERFORMANCE_EVENTS.METRIC_CALCULATED, {
    userId,
    periodId,
    metricType,
    value,
    calculatedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitEquitySnapshotCaptured(userId, snapshotId, meta = {}) {
  return publish(PERFORMANCE_EVENTS.EQUITY_SNAPSHOT_CAPTURED, {
    userId,
    snapshotId,
    capturedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitEquityReconstructed(userId, periodId, points, meta = {}) {
  return publish(PERFORMANCE_EVENTS.EQUITY_RECONSTRUCTED, {
    userId,
    periodId,
    points,
    reconstructedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitEligibleNetProfitComputed(userId, periodId, value, meta = {}) {
  return publish(PERFORMANCE_EVENTS.ELIGIBLE_NET_PROFIT_COMPUTED, {
    userId,
    periodId,
    value,
    computedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitPeriodCalculationFailed(userId, periodId, error, meta = {}) {
  return publish(PERFORMANCE_EVENTS.PERIOD_CALCULATION_FAILED, {
    userId,
    periodId,
    error: typeof error === 'string' ? error : error.message,
    failedAt: new Date().toISOString(),
    ...meta,
  });
}

export { PERFORMANCE_EVENTS };