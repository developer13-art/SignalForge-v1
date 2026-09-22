/**
 * Metrics Configuration
 *
 * Configures the metrics endpoint and collection used for
 * observability. Exposes Prometheus-compatible metrics.
 *
 * @module signalforge/server/config/metrics
 */

function toNumber(value, fallback = null) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  return ['true', '1', 'yes', 'on', 'enabled'].includes(String(value).toLowerCase());
}

const metricsConfig = Object.freeze({
  enabled: toBoolean(process.env.METRICS_ENABLED, true),
  port: toNumber(process.env.METRICS_PORT, 9090),
  path: process.env.METRICS_PATH || '/metrics',
  host: process.env.METRICS_HOST || '0.0.0.0',

  collection: {
    intervalMs: toNumber(process.env.METRICS_INTERVAL_MS, 15000),
    collectDefaultMetrics: toBoolean(process.env.METRICS_DEFAULT, true),
    collectProcessMetrics: true,
    collectRuntimeMetrics: true,
    collectDbMetrics: true,
    collectHttpMetrics: true,
    collectBusinessMetrics: true,
  },

  http: {
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    includePath: true,
    excludePaths: ['/metrics', '/health', '/ready', '/live'],
    normalizePaths: true,
  },

  business: {
    signalPipelineDuration: true,
    signalCount: true,
    tradeCount: true,
    tradeLatency: true,
    executionLatency: true,
    providerDnaAccuracy: true,
    aiTokenUsage: true,
    aiCost: true,
    kycStatusCounts: true,
    subscriptionCounts: true,
    paymentVolume: true,
    referralRewards: true,
    walletBalances: true,
    solanaTransactionCount: true,
    solanaAttestationCount: true,
    brokerConnectionStatus: true,
    websocketConnections: true,
    jobQueueDepth: true,
    jobProcessingTime: true,
  },

  labels: {
    environment: process.env.NODE_ENV || 'development',
    service: 'signalforge',
    version: '1.0.0',
    region: process.env.APP_REGION || 'default',
    instance: process.env.HOSTNAME || 'unknown',
  },

  histogramBuckets: {
    httpRequest: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
    dbQuery: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
    externalApi: [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    aiCall: [0.1, 0.5, 1, 2, 5, 10, 30, 60],
    tradeExecution: [0.05, 0.1, 0.25, 0.5, 1, 2, 5],
    solanaTx: [0.5, 1, 2, 5, 10, 30, 60],
  },
});

export default metricsConfig;