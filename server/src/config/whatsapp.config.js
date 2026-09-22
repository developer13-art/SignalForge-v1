/**
 * WhatsApp Configuration
 *
 * Configures WhatsApp Cloud API and Business API integration for
 * signal ingestion.
 *
 * @module signalforge/server/config/whatsapp
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

const whatsAppConfig = Object.freeze({
  enabled: toBoolean(process.env.WHATSAPP_ENABLED, true),

  mode: process.env.WHATSAPP_MODE || 'cloud',
  supportedModes: ['cloud', 'business'],

  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || null,
  businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || null,
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN || null,
  verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || null,

  baseUrl: process.env.WHATSAPP_BASE_URL || 'https://graph.facebook.com/v20.0',

  webhook: {
    verifySignature: toBoolean(process.env.WHATSAPP_VERIFY_SIGNATURE, true),
    appSecret: process.env.WHATSAPP_APP_SECRET || null,
    signatureHeader: 'x-hub-signature-256',
  },

  listener: {
    enabled: toBoolean(process.env.WHATSAPP_LISTENER_ENABLED, true),
    processEdits: true,
    processDeletes: true,
    processMedia: toBoolean(process.env.WHATSAPP_PROCESS_MEDIA, true),
    batchSize: toNumber(process.env.WHATSAPP_BATCH_SIZE, 50),
  },

  groups: {
    monitoringEnabled: toBoolean(process.env.WHATSAPP_GROUPS_ENABLED, true),
    maxGroupsPerUser: toNumber(process.env.WHATSAPP_MAX_GROUPS_PER_USER, 20),
    requireExplicitOptIn: true,
  },

  message: {
    maxTextLength: toNumber(process.env.WHATSAPP_MAX_TEXT_LENGTH, 4096),
    maxMediaSizeBytes: toNumber(process.env.WHATSAPP_MAX_MEDIA_SIZE, 16 * 1024 * 1024),
    supportedMediaTypes: ['image', 'video', 'audio', 'document'],
    preserveRawPayload: toBoolean(process.env.WHATSAPP_PRESERVE_RAW, true),
  },

  rateLimit: {
    messagesPerSecond: toNumber(process.env.WHATSAPP_RATE_LIMIT_PER_SECOND, 10),
    messagesPerDay: toNumber(process.env.WHATSAPP_RATE_LIMIT_PER_DAY, 1000),
  },

  retry: {
    maxAttempts: toNumber(process.env.WHATSAPP_RETRY_MAX_ATTEMPTS, 3),
    baseDelayMs: toNumber(process.env.WHATSAPP_RETRY_BASE_DELAY_MS, 2000),
  },

  timeoutMs: toNumber(process.env.WHATSAPP_TIMEOUT_MS, 30000),
});

export default whatsAppConfig;