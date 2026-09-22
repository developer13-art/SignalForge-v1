/**
 * MetaApi Configuration
 *
 * Configures MetaApi, the cloud MT4/MT5 execution gateway used by
 * SignalForge. MetaApi tokens are never exposed to the frontend.
 *
 * @module signalforge/server/config/metaapi
 */

function required(name, value) {
  if (value !== undefined && value !== null && value !== '') {
    return value;
  }
  throw new Error(`Missing required environment variable: ${name}`);
}

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

const metaApiConfig = Object.freeze({
  enabled: toBoolean(process.env.METAAPI_ENABLED, true),
  token: process.env.METAAPI_TOKEN || null,
  baseUrl:
    process.env.METAAPI_BASE_URL ||
    'https://mt-client-api-v1.new-york.agiliumtrade.ai',
  provisioningUrl:
    process.env.METAAPI_PROVISIONING_URL ||
    'https://mt-provisioning-api-v1.agiliumtrade.ai',
  wsUrl:
    process.env.METAAPI_WS_URL ||
    'wss://mt-client-api-v1.new-york.agiliumtrade.ai',

  requestTimeoutMs: toNumber(process.env.METAAPI_REQUEST_TIMEOUT_MS, 30000),
  deployTimeoutMs: toNumber(process.env.METAAPI_DEPLOY_TIMEOUT_MS, 180000),

  retry: {
    maxAttempts: toNumber(process.env.METAAPI_RETRY_ATTEMPTS, 3),
    baseDelayMs: toNumber(process.env.METAAPI_RETRY_BASE_DELAY_MS, 2000),
    maxDelayMs: toNumber(process.env.METAAPI_RETRY_MAX_DELAY_MS, 15000),
  },

  reconnect: {
    enabled: true,
    initialDelayMs: toNumber(process.env.METAAPI_RECONNECT_INITIAL_DELAY_MS, 1000),
    maxDelayMs: toNumber(process.env.METAAPI_RECONNECT_MAX_DELAY_MS, 30000),
    factor: toNumber(process.env.METAAPI_RECONNECT_FACTOR, 2),
  },

  sync: {
    positionsIntervalMs: toNumber(process.env.METAAPI_SYNC_POSITIONS_INTERVAL_MS, 15000),
    accountIntervalMs: toNumber(process.env.METAAPI_SYNC_ACCOUNT_INTERVAL_MS, 30000),
    historyIntervalMs: toNumber(process.env.METAAPI_SYNC_HISTORY_INTERVAL_MS, 60000),
  },

  stream: {
    enabled: toBoolean(process.env.METAAPI_STREAM_ENABLED, true),
    keepAlive: true,
    reconnectOnClose: true,
    requestPositionsOnConnect: true,
  },

  deployment: {
    autoDeploy: toBoolean(process.env.METAAPI_AUTO_DEPLOY, true),
    region: process.env.METAAPI_REGION || 'new-york',
    magicPrefix: toNumber(process.env.METAAPI_MAGIC_PREFIX, 900000),
  },

  rateLimit: {
    requestsPerMinute: toNumber(process.env.METAAPI_RATE_LIMIT_PER_MINUTE, 1000),
    concurrentRequests: toNumber(process.env.METAAPI_CONCURRENT_REQUESTS, 25),
  },

  platforms: {
    mt4: {
      supported: true,
      path: '/users/current/accounts',
    },
    mt5: {
      supported: true,
      path: '/users/current/accounts',
    },
  },

  riskGuard: {
    maxSpreadPips: toNumber(process.env.METAAPI_MAX_SPREAD_PIPS, 5),
    maxSlippagePips: toNumber(process.env.METAAPI_MAX_SLIPPAGE_PIPS, 3),
    maxLatencyMs: toNumber(process.env.METAAPI_MAX_LATENCY_MS, 2000),
  },

  logging: {
    logRequests: toBoolean(process.env.METAAPI_LOG_REQUESTS, false),
    logResponses: toBoolean(process.env.METAAPI_LOG_RESPONSES, false),
    redactSensitive: true,
  },
});

export default metaApiConfig;