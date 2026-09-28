/**
 * Database Connection
 *
 * Manages the PostgreSQL connection pool. All database access in the
 * platform flows through this module so that pool lifecycle,
 * connection errors, and configuration are handled centrally.
 *
 * The pool is built from DATABASE_URL when it is present (the
 * preferred configuration, especially on Neon), and falls back to
 * the individual host / port / user / password fields only when
 * DATABASE_URL is not set. This keeps the module compatible with
 * both managed providers and self-hosted PostgreSQL.
 *
 * @module server/database/connection
 */

const pg = require('pg');
const { config } = require('../config');
const { logger } = require('../lib/logger');

const { Pool } = pg;

let pool = null;

function resolveConnectionString() {
  const dbConfig = config.database || {};
  return (
    dbConfig.url ||
    process.env.DATABASE_URL ||
    process.env.DIRECT_URL ||
    null
  );
}

function buildPoolConfig() {
  const dbConfig = config.database || {};
  const connectionString = resolveConnectionString();

  const baseOptions = {
    min: dbConfig.poolMin || 2,
    max: dbConfig.poolMax || 20,
    idleTimeoutMillis: dbConfig.idleTimeoutMs || 30000,
    connectionTimeoutMillis: dbConfig.connectionTimeoutMs || 10000,
    application_name: 'signalforge-server',
  };

  if (connectionString) {
    const useSsl = connectionString.includes('sslmode=require')
      || connectionString.includes('sslmode=verify')
      || dbConfig.ssl === true;

    return {
      connectionString,
      ssl: useSsl ? { rejectUnauthorized: false } : false,
      ...baseOptions,
    };
  }

  return {
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.name,
    user: dbConfig.user,
    password: dbConfig.password,
    ssl: dbConfig.ssl ? { rejectUnauthorized: false } : false,
    ...baseOptions,
  };
}

function getPool() {
  if (!pool) {
    const poolConfig = buildPoolConfig();
    pool = new Pool(poolConfig);

    pool.on('error', (err) => {
      logger.error({ err }, 'Unexpected PostgreSQL pool error');
    });

    pool.on('connect', () => {
      logger.debug('PostgreSQL client connected');
    });

    logger.info(
      {
        mode: poolConfig.connectionString ? 'connectionString' : 'individual',
        host: poolConfig.host || null,
        database: poolConfig.database || null,
        poolMin: poolConfig.min,
        poolMax: poolConfig.max,    
      },
      'PostgreSQL pool initialized',
    );
  }

  return pool;
}

async function getClient() {
  const activePool = getPool();
  return activePool.connect();
}

async function query(text, params) {
  const activePool = getPool();
  return activePool.query(text, params);
}

async function withClient(handler) {
  const client = await getClient();
  try {
    return await handler(client);
  } finally {
    client.release();
  }
}

async function withTransaction(handler) {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await handler(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (_rollbackError) {
      // Ignore rollback errors — the original error is what matters.
    }
    throw error;
  } finally {
    client.release();
  }
}

async function closePool() {
  if (!pool) {
    return;
  }

  const activePool = pool;
  pool = null;

  try {
    await activePool.end();
    logger.info('PostgreSQL pool closed');
  } catch (err) {
    logger.error({ err }, 'Error while closing PostgreSQL pool');
  }
}

const db = {
  query,
  getClient,
  withClient,
  withTransaction,
};

module.exports = {
  db,
  getPool,
  getClient,
  query,
  withClient,
  withTransaction,
  closePool,
};
module.exports.default = db;