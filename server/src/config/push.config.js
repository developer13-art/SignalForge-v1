/**
 * Push Notification Configuration
 *
 * Configures push notification delivery for SignalForge.
 *
 * @module signalforge/server/config/push
 */

function toBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  return ['true', '1', 'yes', 'on', 'enabled'].includes(String(value).toLowerCase());
}

function toNumber(value, fallback = null) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const pushConfig = Object.freeze({
  enabled: toBoolean(process.env.PUSH_ENABLED, true),
  provider: process.env.PUSH_PROVIDER || 'fcm',

  fcm: {
    serverKey: process.env.FCM_SERVER_KEY || null,
    projectId: process.env.FCM_PROJECT_ID || null,
    clientEmail: process.env.FCM_CLIENT_EMAIL || null,
    privateKey: process.env.FCM_PRIVATE_KEY
      ? process.env.FCM_PRIVATE_KEY.replace(/\\n/g, '\n')
      : null,
    apiUrl: 'https://fcm.googleapis.com/v1/projects',
  },

  apns: {
    keyId: process.env.APNS_KEY_ID || null,
    teamId: process.env.APNS_TEAM_ID || null,
    bundleId: process.env.APNS_BUNDLE_ID || null,
    privateKey: process.env.APNS_PRIVATE_KEY || null,
    production: toBoolean(process.env.APNS_PRODUCTION, false),
  },

  defaultSound: 'default',
  defaultBadge: 1,
  defaultChannelId: 'signalforge-default',

  androidChannels: {
    trades: 'signalforge-trades',
    signals: 'signalforge-signals',
    security: 'signalforge-security',
    kyc: 'signalforge-kyc',
  },

  iosCategories: {
    trade: 'TRADE_CATEGORY',
    signal: 'SIGNAL_CATEGORY',
    security: 'SECURITY_CATEGORY',
  },

  rateLimit: {
    perDevicePerMinute: toNumber(process.env.PUSH_RATE_LIMIT_PER_DEVICE_PER_MINUTE, 30),
    perDevicePerHour: toNumber(process.env.PUSH_RATE_LIMIT_PER_DEVICE_PER_HOUR, 200),
  },

  retry: {
    maxAttempts: toNumber(process.env.PUSH_RETRY_MAX_ATTEMPTS, 3),
    baseDelayMs: toNumber(process.env.PUSH_RETRY_BASE_DELAY_MS, 2000),
  },

  ttlSeconds: toNumber(process.env.PUSH_TTL_SECONDS, 2419200),
  priority: process.env.PUSH_PRIORITY || 'high',
});

export default pushConfig;