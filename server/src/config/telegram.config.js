/**
 * Telegram Configuration
 *
 * Configures the Telegram User Session integration used to monitor
 * provider channels and groups. A User Session is used instead of a
 * bot because most premium providers do not permit bots in their
 * channels.
 *
 * @module signalforge/server/config/telegram
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

const telegramConfig = Object.freeze({
  enabled: toBoolean(process.env.TELEGRAM_ENABLED, true),

  apiId: process.env.TELEGRAM_API_ID ? Number(process.env.TELEGRAM_API_ID) : null,
  apiHash: process.env.TELEGRAM_API_HASH || null,

  session: {
    encryptionKey: process.env.TELEGRAM_SESSION_ENCRYPTION_KEY || null,
    storage: process.env.TELEGRAM_SESSION_STORAGE || 'database',
    reconnectDelayMs: toNumber(process.env.TELEGRAM_RECONNECT_DELAY_MS, 5000),
    maxReconnectAttempts: toNumber(process.env.TELEGRAM_MAX_RECONNECT_ATTEMPTS, 10),
    healthCheckIntervalMs: toNumber(
      process.env.TELEGRAM_HEALTH_CHECK_INTERVAL_MS,
      60000,
    ),
    expiryWarningDays: toNumber(process.env.TELEGRAM_EXPIRY_WARNING_DAYS, 7),
  },

  login: {
    otpLength: 5,
    otpExpiryMinutes: toNumber(process.env.TELEGRAM_OTP_EXPIRY_MINUTES, 5),
    maxOtpAttempts: toNumber(process.env.TELEGRAM_MAX_OTP_ATTEMPTS, 3),
    require2FA: toBoolean(process.env.TELEGRAM_REQUIRE_2FA, true),
  },

  channels: {
    discoveryBatchSize: toNumber(process.env.TELEGRAM_DISCOVERY_BATCH_SIZE, 100),
    maxChannelsPerUser: toNumber(process.env.TELEGRAM_MAX_CHANNELS_PER_USER, 50),
    requireExplicitOptIn: true,
    allowPrivateGroups: true,
    allowChannels: true,
  },

  listener: {
    enabled: toBoolean(process.env.TELEGRAM_LISTENER_ENABLED, true),
    batchSize: toNumber(process.env.TELEGRAM_LISTENER_BATCH_SIZE, 50),
    pollIntervalMs: toNumber(process.env.TELEGRAM_LISTENER_POLL_INTERVAL_MS, 1000),
    messageBufferSize: toNumber(process.env.TELEGRAM_MESSAGE_BUFFER_SIZE, 1000),
    concurrentHandlers: toNumber(process.env.TELEGRAM_CONCURRENT_HANDLERS, 10),
    processEdits: toBoolean(process.env.TELEGRAM_PROCESS_EDITS, true),
    processDeletes: toBoolean(process.env.TELEGRAM_PROCESS_DELETES, true),
    processMedia: toBoolean(process.env.TELEGRAM_PROCESS_MEDIA, true),
  },

  rateLimit: {
    messagesPerSecond: toNumber(process.env.TELEGRAM_RATE_LIMIT_PER_SECOND, 30),
    requestsPerMinute: toNumber(process.env.TELEGRAM_RATE_LIMIT_PER_MINUTE, 1000),
  },

  message: {
    maxTextLength: toNumber(process.env.TELEGRAM_MAX_TEXT_LENGTH, 4096),
    maxMediaSizeBytes: toNumber(process.env.TELEGRAM_MAX_MEDIA_SIZE, 20 * 1024 * 1024),
    supportedMediaTypes: ['photo', 'document', 'video', 'audio', 'voice'],
    preserveRawPayload: toBoolean(process.env.TELEGRAM_PRESERVE_RAW, true),
  },
});

export default telegramConfig;