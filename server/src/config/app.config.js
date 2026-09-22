/**
 * Application Configuration
 *
 * Reads runtime settings for the SignalForge backend from environment
 * variables and provides safe defaults for local development.
 *
 * @module signalforge/server/config/app
 */

function required(name, value, fallback) {
  if (value !== undefined && value !== null && value !== '') {
    return value;
  }
  if (fallback !== undefined) {
    return fallback;
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
  const lower = String(value).toLowerCase();
  return ['true', '1', 'yes', 'on', 'enabled'].includes(lower);
}

const env = process.env.NODE_ENV || 'development';

const appConfig = Object.freeze({
  name: 'SignalForge',
  version: '1.0.0',
  env,
  isDevelopment: env === 'development',
  isProduction: env === 'production',
  isTest: env === 'test',
  isStaging: env === 'staging',

  port: toNumber(process.env.APP_PORT, 4000),
  appUrl: required('APP_URL', process.env.APP_URL, 'http://localhost:3000'),
  apiUrl: required('API_URL', process.env.API_URL, 'http://localhost:4000'),

  timezone: process.env.APP_TIMEZONE || 'UTC',
  locale: process.env.APP_LOCALE || 'en',

  trustProxy: toBoolean(process.env.APP_TRUST_PROXY, true),
  requestIdHeader: 'x-request-id',
  responseTimeHeader: 'x-response-time',

  shutdownTimeoutMs: toNumber(process.env.APP_SHUTDOWN_TIMEOUT_MS, 30000),
  startupTimeoutMs: toNumber(process.env.APP_STARTUP_TIMEOUT_MS, 60000),

  maxRequestBodySize: process.env.APP_MAX_BODY_SIZE || '10mb',
  maxFileUploadSize: process.env.APP_MAX_FILE_SIZE || '25mb',

  supportEmail: process.env.APP_SUPPORT_EMAIL || 'support@signalforge.ai',
  noreplyEmail: process.env.APP_NOREPLY_EMAIL || 'no-reply@signalforge.ai',

  maintenanceMode: toBoolean(process.env.APP_MAINTENANCE_MODE, false),
  maintenanceMessage:
    process.env.APP_MAINTENANCE_MESSAGE ||
    'SignalForge is temporarily unavailable for scheduled maintenance.',

  healthCheckPath: '/api/health',
  readinessCheckPath: '/api/ready',
  livenessCheckPath: '/api/live',
});

export default appConfig;