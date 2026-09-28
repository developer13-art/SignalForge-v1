'use strict';

/**
 * Database Configuration
 *
 * Configures PostgreSQL connection settings for SignalForge.
 * Uses the `pg` driver.
 *
 * Preferred input: DATABASE_URL (a full Postgres connection string,
 * which is what Neon provides). If DATABASE_URL is absent, the
 * individual DB_* variables are used instead.
 *
 * @module signalforge/server/config/database
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

function parseDatabaseUrl(rawUrl) {
  if (!rawUrl) {
    return null;
  }
  try {
    const url = new URL(rawUrl);
    return {
      host: url.hostname,
      port: url.port ? Number(url.port) : 5432,
      name: url.pathname ? url.pathname.replace(/^\//, '') : null,
      user: url.username ? decodeURIComponent(url.username) : null,
      password: url.password ? decodeURIComponent(url.password) : null,
      ssl: url.searchParams.get('sslmode') !== 'disable',
    };
  } catch (_error) {
    return null;
  }
}

const parsedUrl = parseDatabaseUrl(process.env.DATABASE_URL);

const host = parsedUrl ? parsedUrl.host : process.env.DB_HOST;
const port = parsedUrl ? parsedUrl.port : toNumber(process.env.DB_PORT, 5432);
const name = parsedUrl ? parsedUrl.name : process.env.DB_NAME;
const user = parsedUrl ? parsedUrl.user : process.env.DB_USER;
const password = parsedUrl ? parsedUrl.password : process.env.DB_PASSWORD;

const sslEnabled = parsedUrl
  ? parsedUrl.ssl
  : toBoolean(process.env.DB_SSL, false);

const databaseConfig = Object.freeze({
  url: process.env.DATABASE_URL || null,
  directUrl: process.env.DIRECT_URL || null,

  host,
  port,
  name,
  user,
  password,

  ssl: sslEnabled
    ? { rejectUnauthorized: toBoolean(process.env.DB_SSL_REJECT_UNAUTHORIZED, false) }
    : false,

  pool: {
    min: toNumber(process.env.DB_POOL_MIN, 2),
    max: toNumber(process.env.DB_POOL_MAX, 20),
    idleTimeoutMillis: toNumber(process.env.DB_IDLE_TIMEOUT_MS, 30000),
    connectionTimeoutMillis: toNumber(process.env.DB_CONNECTION_TIMEOUT_MS, 10000),
    acquireTimeoutMillis: toNumber(process.env.DB_ACQUIRE_TIMEOUT_MS, 60000),
    statementTimeoutMillis: toNumber(process.env.DB_STATEMENT_TIMEOUT_MS, 30000),
    queryTimeoutMillis: toNumber(process.env.DB_QUERY_TIMEOUT_MS, 30000),
    applicationName: 'signalforge-server',
    maxUses: toNumber(process.env.DB_MAX_USES, 7500),
  },

  migrations: {
    directory: './src/database/migrations',
    tableName: 'schema_migrations',
    lockTimeoutMs: toNumber(process.env.DB_MIGRATION_LOCK_TIMEOUT_MS, 60000),
  },

  logQueries: toBoolean(process.env.DB_LOG_QUERIES, false),
  logSlowQueriesMs: toNumber(process.env.DB_LOG_SLOW_QUERIES_MS, 500),

  advisoryLockNamespace: toNumber(process.env.DB_ADVISORY_LOCK_NAMESPACE, 4242),
  advisoryLockTimeoutMs: toNumber(process.env.DB_ADVISORY_LOCK_TIMEOUT_MS, 60000),

  statementCacheSize: toNumber(process.env.DB_STATEMENT_CACHE_SIZE, 100),

  retry: {
    maxAttempts: toNumber(process.env.DB_RETRY_MAX_ATTEMPTS, 5),
    baseDelayMs: toNumber(process.env.DB_RETRY_BASE_DELAY_MS, 500),
    maxDelayMs: toNumber(process.env.DB_RETRY_MAX_DELAY_MS, 5000),
  },

  healthCheck: {
    intervalMs: toNumber(process.env.DB_HEALTH_CHECK_INTERVAL_MS, 30000),
    timeoutMs: toNumber(process.env.DB_HEALTH_CHECK_TIMEOUT_MS, 5000),
  },
});

module.exports = databaseConfig;