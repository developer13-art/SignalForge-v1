/**
 * IMAP Configuration
 *
 * Configures IMAP email integration for signal ingestion.
 *
 * @module signalforge/server/config/imap
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

const imapConfig = Object.freeze({
  enabled: toBoolean(process.env.IMAP_ENABLED, true),

  host: process.env.IMAP_HOST || null,
  port: toNumber(process.env.IMAP_PORT, 993),
  secure: toBoolean(process.env.IMAP_SECURE, true),
  user: process.env.IMAP_USER || null,
  password: process.env.IMAP_PASSWORD || null,
  mailbox: process.env.IMAP_MAILBOX || 'INBOX',

  smtp: {
    host: process.env.SMTP_HOST || null,
    port: toNumber(process.env.SMTP_PORT, 587),
    secure: toBoolean(process.env.SMTP_SECURE, false),
    user: process.env.SMTP_USER || null,
    password: process.env.SMTP_PASSWORD || null,
  },

  listener: {
    enabled: toBoolean(process.env.IMAP_LISTENER_ENABLED, true),
    pollIntervalMs: toNumber(process.env.IMAP_POLL_INTERVAL_MS, 30000),
    fetchBatchSize: toNumber(process.env.IMAP_FETCH_BATCH_SIZE, 50),
    markAsSeen: toBoolean(process.env.IMAP_MARK_AS_SEEN, true),
    moveProcessedTo: process.env.IMAP_PROCESSED_FOLDER || null,
    useIdle: toBoolean(process.env.IMAP_USE_IDLE, true),
  },

  parsing: {
    parseAttachments: toBoolean(process.env.IMAP_PARSE_ATTACHMENTS, true),
    parseHtmlBody: toBoolean(process.env.IMAP_PARSE_HTML, true),
    preferPlainText: toBoolean(process.env.IMAP_PREFER_PLAIN, true),
    maxBodySizeBytes: toNumber(process.env.IMAP_MAX_BODY_SIZE, 5 * 1024 * 1024),
    maxAttachmentSizeBytes: toNumber(
      process.env.IMAP_MAX_ATTACHMENT_SIZE,
      20 * 1024 * 1024,
    ),
    supportedAttachmentTypes: ['text/plain', 'text/csv', 'application/pdf'],
  },

  security: {
    tlsRejectUnauthorized: toBoolean(process.env.IMAP_TLS_REJECT_UNAUTHORIZED, true),
    tlsMinVersion: process.env.IMAP_TLS_MIN_VERSION || 'TLSv1.2',
    allowSelfSigned: toBoolean(process.env.IMAP_ALLOW_SELF_SIGNED, false),
  },

  retry: {
    maxAttempts: toNumber(process.env.IMAP_RETRY_MAX_ATTEMPTS, 3),
    baseDelayMs: toNumber(process.env.IMAP_RETRY_BASE_DELAY_MS, 5000),
    maxDelayMs: toNumber(process.env.IMAP_RETRY_MAX_DELAY_MS, 60000),
  },

  connectionTimeoutMs: toNumber(process.env.IMAP_CONNECTION_TIMEOUT_MS, 30000),
  greetingTimeoutMs: toNumber(process.env.IMAP_GREETING_TIMEOUT_MS, 15000),
  socketTimeoutMs: toNumber(process.env.IMAP_SOCKET_TIMEOUT_MS, 120000),
});

export default imapConfig;