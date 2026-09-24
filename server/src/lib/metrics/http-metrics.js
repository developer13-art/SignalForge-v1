/**
 * HTTP Metrics
 *
 * @module server/lib/metrics/http-metrics
 */

const METRICS = {
  requestCount: 0,
  responseTimeSum: 0,
  responseTimeCount: 0,
  errorCount: 0,
  byRoute: new Map(),
  byStatus: new Map(),
};

export function recordHttpRequest({ route, method, statusCode, durationMs }) {
  METRICS.requestCount++;
  METRICS.responseTimeSum += durationMs;
  METRICS.responseTimeCount++;

  if (statusCode >= 400) {
    METRICS.errorCount++;
  }

  const key = `${method} ${route}`;
  const routeStats = METRICS.byRoute.get(key) || { count: 0, errorCount: 0, totalTimeMs: 0 };
  routeStats.count++;
  routeStats.totalTimeMs += durationMs;
  if (statusCode >= 400) {
    routeStats.errorCount++;
  }
  METRICS.byRoute.set(key, routeStats);

  METRICS.byStatus.set(statusCode, (METRICS.byStatus.get(statusCode) || 0) + 1);
}

export function getHttpMetrics() {
  return {
    requestCount: METRICS.requestCount,
    errorCount: METRICS.errorCount,
    averageResponseTimeMs:
      METRICS.responseTimeCount > 0 ? METRICS.responseTimeSum / METRICS.responseTimeCount : 0,
    byRoute: Array.from(METRICS.byRoute.entries()).map(([route, stats]) => ({
      route,
      ...stats,
      averageTimeMs: stats.count > 0 ? stats.totalTimeMs / stats.count : 0,
    })),
    byStatus: Array.from(METRICS.byStatus.entries()).map(([status, count]) => ({ status, count })),
  };
}

export function resetHttpMetrics() {
  METRICS.requestCount = 0;
  METRICS.responseTimeSum = 0;
  METRICS.responseTimeCount = 0;
  METRICS.errorCount = 0;
  METRICS.byRoute.clear();
  METRICS.byStatus.clear();
}

export const httpMetrics = {
  recordHttpRequest,
  getHttpMetrics,
  resetHttpMetrics,
};