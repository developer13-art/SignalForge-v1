/**
 * Database Initialization
 *
 * Creates and configures the PostgreSQL connection pool, verifies
 * connectivity, and installs helper functions used across the
 * platform.
 *
 * @module signalforge/server/bootstrap/initDatabase
 */

import pg from 'pg';

import databaseConfig from '../config/database.config.js';
import { getLogger } from './initLogger.js';

const { Pool } = pg;

let pool = null;
let healthCheckTimer = null;

function buildPoolConfig() {
  return {
    host: databaseConfig.host,
    port: databaseConfig.port,
    database: databaseConfig.database,
    user: databaseConfig.user,
    password: databaseConfig.password,
    ssl: databaseConfig.ssl,
    min: databaseConfig.pool.min,
    max: databaseConfig.pool.max,
    idleTimeoutMillis: databaseConfig.pool.idleTimeoutMillis,
    connectionTimeoutMillis: databaseConfig.pool.connectionTimeoutMillis,
    statement_timeout: databaseConfig.pool.statementTimeoutMillis,
    query_timeout: databaseConfig.pool.queryTimeoutMillis,
    application_name: databaseConfig.pool.applicationName,
    maxUses: databaseConfig.pool.maxUses,
  };
}

export async function initDatabase() {
  const logger = getLogger('database');

  if (pool) {
    logger.warn('Database pool already initialized');
    return wrapDatabase(pool);
  }

  pool = new Pool(buildPoolConfig());

  pool.on('error', (error) => {
    logger.error({ err: error }, 'Database pool idle client error');
  });

  pool.on('connect', () => {
    logger.debug('Database client connected');
  });

  pool.on('acquire', () => {
    logger.trace('Database client acquired');
  });

  pool.on('remove', () => {
    logger.debug('Database client removed');
  });

  try {
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      logger.info('Database connection established');
    } finally {
      client.release();
    }
  } catch (error) {
    logger.fatal({ err: error }, 'Failed to connect to database');
    await pool.end().catch(() => {});
    pool = null;
    throw error;
  }

  if (databaseConfig.healthCheck.intervalMs > 0) {
    healthCheckTimer = setInterval(async () => {
      try {
        const client = await pool.connect();
        try {
          await client.query('SELECT 1');
        } finally {
          client.release();
        }
      } catch (error) {
        logger.error({ err: error }, 'Database health check failed');
      }
    }, databaseConfig.healthCheck.intervalMs);
    if (healthCheckTimer.unref) {
      healthCheckTimer.unref();
    }
  }

  return wrapDatabase(pool);
}

function wrapDatabase(activePool) {
  return {
    pool: activePool,

    async query(text, params) {
      const start = Date.now();
      const result = await activePool.query(text, params);
      const duration = Date.now() - start;

      if (databaseConfig.logSlowQueriesMs > 0 && duration > databaseConfig.logSlowQueriesMs) {
        const logger = getLogger('database');
        logger.warn(
          {
            duration,
            rowCount: result.rowCount,
            command: result.command,
          },
          'Slow query detected',
        );
      }

      return result;
    },

    async withClient(fn) {
      const client = await activePool.connect();
      try {
        return await fn(client);
      } finally {
        client.release();
      }
    },

    async transaction(fn, options = {}) {
      const client = await activePool.connect();
      try {
        const isolationLevel = options.isolationLevel;
        if (isolationLevel) {
          await client.query(`SET TRANSACTION ISOLATION LEVEL ${isolationLevel}`);
        }

        await client.query('BEGIN');

        try {
          const result = await fn(client);
          await client.query('COMMIT');
          return result;
        } catch (error) {
          await client.query('ROLLBACK').catch(() => {});
          throw error;
        }
      } finally {
        client.release();
      }
    },

    async advisoryLock(lockId, fn, options = {}) {
      const timeoutMs = options.timeoutMs || databaseConfig.advisoryLockTimeoutMs;
      const namespace = databaseConfig.advisoryLockNamespace;
      const lockKey = `${namespace}:${lockId}`;

      const client = await activePool.connect();
      try {
        await client.query('BEGIN');

        const acquireResult = await client.query(
          'SELECT pg_try_advisory_xact_lock(hashtext($1)) AS acquired',
          [lockKey],
        );

        if (!acquireResult.rows[0].acquired) {
          const start = Date.now();
          const interval = 100;
          let acquired = false;
          while (Date.now() - start < timeoutMs) {
            await new Promise((r) => setTimeout(r, interval));
            const retry = await client.query(
              'SELECT pg_try_advisory_xact_lock(hashtext($1)) AS acquired',
              [lockKey],
            );
            if (retry.rows[0].acquired) {
              acquired = true;
              break;
            }
          }
          if (!acquired) {
            await client.query('ROLLBACK');
            throw new Error(
              `Could not acquire advisory lock ${lockId} within ${timeoutMs}ms`,
            );
          }
        }

        try {
          const result = await fn(client);
          await client.query('COMMIT');
          return result;
        } catch (error) {
          await client.query('ROLLBACK').catch(() => {});
          throw error;
        }
      } finally {
        client.release();
      }
    },

    async healthCheck() {
      try {
        await activePool.query('SELECT 1');
        return { healthy: true };
      } catch (error) {
        return { healthy: false, error: error.message };
      }
    },

    async close() {
      if (healthCheckTimer) {
        clearInterval(healthCheckTimer);
        healthCheckTimer = null;
      }
      if (activePool) {
        await activePool.end();
        pool = null;
      }
    },

    get stats() {
      return {
        total: activePool.totalCount,
        idle: activePool.idleCount,
        waiting: activePool.waitingCount,
      };
    },
  };
}

export function getDatabase() {
  if (!pool) {
    throw new Error('Database has not been initialized');
  }
  return wrapDatabase(pool);
}

export default initDatabase;