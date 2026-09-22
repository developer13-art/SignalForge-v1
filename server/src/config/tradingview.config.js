/**
 * TradingView Configuration
 *
 * Configures TradingView webhook integration for signal ingestion.
 *
 * @module signalforge/server/config/tradingview
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

const tradingViewConfig = Object.freeze({
  enabled: toBoolean(process.env.TRADINGVIEW_ENABLED, true),

  webhookSecret: process.env.TRADINGVIEW_WEBHOOK_SECRET || null,

  webhookPath: '/api/webhooks/tradingview',

  ipWhitelist: [
    '52.89.214.238',
    '34.212.75.30',
    '54.218.53.128',
    '52.32.178.7',
  ],

  verifyIp: toBoolean(process.env.TRADINGVIEW_VERIFY_IP, false),
  verifySecret: toBoolean(process.env.TRADINGVIEW_VERIFY_SECRET, true),

  replayProtection: {
    enabled: toBoolean(process.env.TRADINGVIEW_REPLAY_PROTECTION, true),
    windowSeconds: toNumber(process.env.TRADINGVIEW_REPLAY_WINDOW_SECONDS, 300),
    cacheSize: toNumber(process.env.TRADINGVIEW_REPLAY_CACHE_SIZE, 10000),
  },

  payload: {
    maxSizeBytes: toNumber(process.env.TRADINGVIEW_MAX_PAYLOAD_SIZE, 100 * 1024),
    requiredFields: ['symbol', 'direction'],
    optionalFields: [
      'action',
      'entry',
      'stopLoss',
      'takeProfit',
      'timeframe',
      'notes',
      'secret',
    ],
    fieldAliases: {
      action: ['action', 'side', 'order'],
      symbol: ['symbol', 'ticker', 'pair'],
      direction: ['direction', 'bias'],
      entry: ['entry', 'price', 'entryPrice'],
      stopLoss: ['stopLoss', 'sl', 'stop'],
      takeProfit: ['takeProfit', 'tp', 'target'],
    },
  },

  rateLimit: {
    requestsPerMinute: toNumber(process.env.TRADINGVIEW_RATE_LIMIT_PER_MINUTE, 300),
    requestsPerSecond: toNumber(process.env.TRADINGVIEW_RATE_LIMIT_PER_SECOND, 10),
  },

  retry: {
    maxAttempts: toNumber(process.env.TRADINGVIEW_RETRY_MAX_ATTEMPTS, 3),
    baseDelayMs: toNumber(process.env.TRADINGVIEW_RETRY_BASE_DELAY_MS, 1000),
  },

  timeoutMs: toNumber(process.env.TRADINGVIEW_TIMEOUT_MS, 15000),
});

export default tradingViewConfig;