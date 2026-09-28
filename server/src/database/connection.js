/**
 * Database Connection
 *
 * Manages the PostgreSQL connection pool. All database access in the
 * platform flows through this module so that pool lifecycle,
 * connection errors, and configuration are handled centrally.
 *
 * @module server/database/connection
 */
const pg = require('pg');
const { config } = require('../config');
const { logger } = require('../lib/logger');

const { Pool } = pg;

let pool = null;

function buildPoolConfig() {
  const dbConfig = config.database || {};

  return {
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.name,
    user: dbConfig.user,
    password: dbConfig.password,
    ssl: dbConfig.ssl ? { rejectUnauthorized: false } : false,
    min: dbConfig.poolMin || 2,
    max: dbConfig.poolMax || 20,
    idleTimeoutMillis: dbConfig.idleTimeoutMs || 30000,
    connectionTimeoutMillis: dbConfig.connectionTimeoutMs || 10000,
    application_name: 'signalforge-server',
  };
}
function getPool() {
  if (!pool) {
    pool = new Pool(buildPoolConfig());

    pool.on('error', (err) => {
      logger.error({ err }, 'Unexpected PostgreSQL pool error');
    });

    pool.on('connect', () => {
      logger.debug('PostgreSQL client connected');
    });

    logger.info(
      { host: config.database.host, database: config.database.name },
      'PostgreSQL pool initialized',
    );
  }

  return pool;
}
async function getClient() {
  const activePool = getPool();
  return activePool.connect();
}
async function closePool() {
  if (!pool) {
    return;
  }

  try {
    await pool.end();
    logger.info('PostgreSQL pool closed');
  } catch (err) {
    logger.error({ err }, 'Error while closing PostgreSQL pool');
  } finally {
    pool = null;
  }
}
const db = {
  query: async (text, params) => {
    const activePool = getPool();
    return activePool.query(text, params);
  },
  getClient,
};
module.exports.db = db;
module.exports.getPool = getPool;

module.exports.getClient = getClient;

module.exports.closePool = closePool;
