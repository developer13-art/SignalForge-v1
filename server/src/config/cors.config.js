/**
 * CORS Configuration
 *
 * Configures Cross-Origin Resource Sharing for the SignalForge API.
 *
 * @module signalforge/server/config/cors
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

const defaultOrigins = [
  'http://localhost:3000',
  'http://localhost:4000',
  'http://127.0.0.1:3000',
];

const envOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = envOrigins.length > 0 ? envOrigins : defaultOrigins;

const corsConfig = Object.freeze({
  enabled: toBoolean(process.env.CORS_ENABLED, true),
  origins: allowedOrigins,
  originWildcard: allowedOrigins.includes('*'),

  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-Request-ID',
    'X-API-Key',
    'X-Tenant-ID',
    'X-Webhook-Signature',
    'X-Paystack-Signature',
    'X-Hub-Signature-256',
    'Accept',
    'Origin',
  ],

  exposedHeaders: [
    'X-Request-ID',
    'X-Response-Time',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
    'Content-Disposition',
  ],

  credentials: toBoolean(process.env.CORS_CREDENTIALS, true),
  maxAge: toNumber(process.env.CORS_MAX_AGE, 86400),

  preflightContinue: false,
  optionsSuccessStatus: 204,
});

export default corsConfig;