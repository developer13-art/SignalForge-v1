/**
 * Session Store Configuration
 *
 * Configures PostgreSQL-backed session storage via connect-pg-simple.
 * Sessions are never stored in memory in production.
 *
 * @module signalforge/server/config/session-store
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

const sessionStoreConfig = Object.freeze({
  tableName: process.env.SESSION_TABLE_NAME || 'user_sessions_store',
  schemaName: process.env.SESSION_SCHEMA_NAME || 'public',
  createTableIfMissing: toBoolean(process.env.SESSION_CREATE_TABLE, false),
  disableTouch: false,
  pruneSessionInterval: toNumber(
    process.env.SESSION_PRUNE_INTERVAL_SECONDS,
    15 * 60,
  ),
  ttlSeconds: toNumber(process.env.SESSION_TTL_SECONDS, 7 * 24 * 60 * 60),
  errorLog: true,
  conString: null,
  pool: null,
});

export default sessionStoreConfig;