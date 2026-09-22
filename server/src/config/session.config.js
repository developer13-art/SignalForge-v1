/**
 * Session Configuration
 *
 * Configures server-side sessions for SignalForge. Sessions are
 * persisted in PostgreSQL via the connect-pg-simple store.
 *
 * @module signalforge/server/config/session
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

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const sessionConfig = Object.freeze({
  secret: required('SESSION_SECRET', process.env.SESSION_SECRET),
  name: process.env.SESSION_NAME || 'signalforge_sid',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookieName: process.env.SESSION_COOKIE_NAME || 'signalforge_sid',
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: toNumber(process.env.SESSION_MAX_AGE_MS, 7 * ONE_DAY_MS),
    domain: process.env.SESSION_COOKIE_DOMAIN || undefined,
  },
  store: {
    tableName: process.env.SESSION_TABLE_NAME || 'user_sessions_store',
    schemaName: process.env.SESSION_SCHEMA_NAME || 'public',
    pruneSessionInterval: toNumber(
      process.env.SESSION_PRUNE_INTERVAL_SECONDS,
      15 * 60,
    ),
    ttlSeconds: toNumber(
      process.env.SESSION_TTL_SECONDS,
      7 * 24 * 60 * 60,
    ),
    disableTouch: false,
    createTableIfMissing: false,
  },
  proxy: toBoolean(process.env.SESSION_PROXY, true),
  unset: 'destroy',
});

export default sessionConfig;