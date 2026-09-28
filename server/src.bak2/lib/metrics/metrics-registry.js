/**
 * Metrics Registry
 *
 * Aggregates all metric sources into a single snapshot for the admin
 * health endpoint or a metrics scraper.
 *
 * @module server/lib/metrics/metrics-registry
 */
const { httpMetrics } = require('./http-metrics');
const { businessMetrics } = require('./business-metrics');

let externalCollectors = [];
function registerMetricsCollector({ name, collector }) {
  if (!name || typeof collector !== 'function') {
    throw new Error('name and collector are required');
  }
  externalCollectors.push({ name, collector });
}

export async function getMetricsSnapshot() {
  const snapshot = {
    timestamp: new Date().toISOString(),
    http: httpMetrics.getHttpMetrics(),
    business: businessMetrics.getBusinessMetrics(),
    collectors: {},
  };

  for (const { name, collector } of externalCollectors) {
    try {
      snapshot.collectors[name] = await collector();
    } catch (err) {
      snapshot.collectors[name] = { error: err.message };
    }
  }

  return snapshot;
}
function resetMetrics() {
  httpMetrics.resetHttpMetrics();
  businessMetrics.resetBusinessMetrics();
}
const metricsRegistry = {
  registerMetricsCollector,
  getMetricsSnapshot,
  resetMetrics,
};
module.exports.metricsRegistry = metricsRegistry;
module.exports.registerMetricsCollector = registerMetricsCollector;
module.exports.resetMetrics = resetMetrics;
