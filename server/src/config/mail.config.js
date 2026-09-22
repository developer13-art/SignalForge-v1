/**
 * Mail Configuration
 *
 * Configures SMTP delivery for SignalForge emails.
 *
 * @module signalforge/server/config/mail
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

const mailConfig = Object.freeze({
  enabled: toBoolean(process.env.MAIL_ENABLED, true),

  host: process.env.MAIL_HOST || 'localhost',
  port: toNumber(process.env.MAIL_PORT, 587),
  secure: toBoolean(process.env.MAIL_SECURE, false),

  auth: {
    user: process.env.MAIL_USER || null,
    pass: process.env.MAIL_PASSWORD || null,
  },

  from: {
    address: process.env.MAIL_FROM_ADDRESS || 'no-reply@signalforge.ai',
    name: process.env.MAIL_FROM_NAME || 'SignalForge',
  },

  replyTo: process.env.MAIL_REPLY_TO || null,

  pool: toBoolean(process.env.MAIL_POOL, true),
  maxConnections: toNumber(process.env.MAIL_MAX_CONNECTIONS, 5),
  maxMessages: toNumber(process.env.MAIL_MAX_MESSAGES, 100),

  connectionTimeoutMs: toNumber(process.env.MAIL_CONNECTION_TIMEOUT_MS, 10000),
  greetingTimeoutMs: toNumber(process.env.MAIL_GREETING_TIMEOUT_MS, 10000),
  socketTimeoutMs: toNumber(process.env.MAIL_SOCKET_TIMEOUT_MS, 30000),

  tls: {
    rejectUnauthorized: toBoolean(process.env.MAIL_TLS_REJECT_UNAUTHORIZED, true),
    minVersion: process.env.MAIL_TLS_MIN_VERSION || 'TLSv1.2',
  },

  dkim: {
    domainName: process.env.MAIL_DKIM_DOMAIN || null,
    keySelector: process.env.MAIL_DKIM_KEY_SELECTOR || null,
    privateKey: process.env.MAIL_DKIM_PRIVATE_KEY || null,
  },

  rateLimit: {
    messagesPerSecond: toNumber(process.env.MAIL_RATE_LIMIT_PER_SECOND, 10),
    messagesPerDay: toNumber(process.env.MAIL_RATE_LIMIT_PER_DAY, 10000),
  },

  retry: {
    maxAttempts: toNumber(process.env.MAIL_RETRY_MAX_ATTEMPTS, 3),
    baseDelayMs: toNumber(process.env.MAIL_RETRY_BASE_DELAY_MS, 2000),
  },

  templates: {
    basePath: './src/modules/notifications/templates/templates',
  },
});

export default mailConfig;