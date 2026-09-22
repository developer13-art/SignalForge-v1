/**
 * Database Configuration
 *
 * Configures PostgreSQL connection settings for SignalForge.
 * Uses the `pg` driver.
 *
 * @module signalforge/server/config/database
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

const databaseConfig = Object.freeze({
  host: required('DB_HOST', process.env.DB_HOST),
  port: toNumber(process.env.DB_PORT, 5432),
  database: required('DB_NAME', process.env.DB_NAME),
  user: required('DB_USER', process.env.DB_USER),
  password: required('DB_PASSWORD', process.env.DB_PASSWORD),

  ssl: toBoolean(process.env.DB_SSL, false)
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
  advisoryLockTimeoutMs: toNumber(process.env.DB_ADVISORY_LOCK_TIMEOUT_MS, 10000),

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

export default databaseConfig;