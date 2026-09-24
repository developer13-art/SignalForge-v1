/**
 * Database Health Check
 *
 * Provides liveness and readiness checks for the PostgreSQL backend
 * and reports pool statistics. Consumed by the admin health endpoint
 * and the platform's external monitoring.
 *
 * @module server/database/health-check
 */

import { getPool } from './connection';
import { logger } from '../lib/logger';

export async function checkDatabaseHealth() {
  const pool = getPool();

  const start = Date.now();

  try {
    const result = await pool.query('SELECT 1 AS ok');
    const latencyMs = Date.now() - start;

    const healthy = result.rows[0] && result.rows[0].ok === 1;

    return {
      healthy,
      latencyMs,
      pool: {
        totalCount: pool.totalCount,
        idleCount: pool.idleCount,
        waitingCount: pool.waitingCount,
      },
    };
  } catch (err) {
    logger.error({ err }, 'Database health check failed');
    return {
      healthy: false,
      error: err.message,
      latencyMs: Date.now() - start,
    };
  }
}

export async function getConnectionStats() {
  const pool = getPool();

  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
    maxConnections: pool.options ? pool.options.max : null,
    minConnections: pool.options ? pool.options.min : null,
  };
}

export async function checkReadiness() {
  const health = await checkDatabaseHealth();

  const ready = health.healthy && health.pool.waitingCount < 50;

  return { ready, health };
}

export const healthCheck = {
  checkDatabaseHealth,
  getConnectionStats,
  checkReadiness,
};