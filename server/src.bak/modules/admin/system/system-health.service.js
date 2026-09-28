/**
 * System Health Service
 *
 * Provides aggregate platform health checks used by the admin console
 * and external monitoring systems. Reports on database connectivity,
 * queue backlogs, integration status, and critical background jobs.
 *
 * @module server/modules/admin/system/system-health.service
 */

import { logger } from '../../../lib/logger';
import { db } from '../../../database';
import { nowIso } from '@signalforge/shared/utils/date.util';

async function checkDatabase() {
  try {
    const start = Date.now();
    await db.query(`SELECT 1 AS ok`);
    return { healthy: true, latencyMs: Date.now() - start };
  } catch (err) {
    logger.error({ err }, 'Database health check failed');
    return { healthy: false, error: err.message };
  }
}

async function checkJobQueue() {
  try {
    const { rows } = await db.query(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'PENDING')::int AS pending,
         COUNT(*) FILTER (WHERE status = 'RUNNING')::int AS running,
         COUNT(*) FILTER (WHERE status = 'FAILED')::int AS failed,
         COUNT(*) FILTER (WHERE status = 'DEAD_LETTER')::int AS dead_letter
         FROM jobs`,
    );

    const stats = rows[0] || { pending: 0, running: 0, failed: 0, dead_letter: 0 };

    const healthy = stats.dead_letter < 100 && stats.failed < 500;

    return {
      healthy,
      ...stats,
    };
  } catch (err) {
    logger.error({ err }, 'Job queue health check failed');
    return { healthy: false, error: err.message };
  }
}

async function checkTelegramListeners() {
  try {
    const { rows } = await db.query(
      `SELECT COUNT(*)::int AS active
         FROM telegram_sessions
        WHERE revoked_at IS NULL`,
    );

    return {
      healthy: true,
      activeSessions: rows[0]?.active || 0,
    };
  } catch (err) {
    return { healthy: false, error: err.message };
  }
}

async function checkBrokerConnections() {
  try {
    const { rows } = await db.query(
      `SELECT
         COUNT(*) FILTER (WHERE connection_status = 'CONNECTED')::int AS connected,
         COUNT(*) FILTER (WHERE connection_status = 'ERROR')::int AS error,
         COUNT(*) FILTER (WHERE connection_status = 'DISCONNECTED')::int AS disconnected
         FROM broker_accounts`,
    );

    const stats = rows[0] || { connected: 0, error: 0, disconnected: 0 };

    const healthy = stats.error < 50;

    return { healthy, ...stats };
  } catch (err) {
    return { healthy: false, error: err.message };
  }
}

async function checkPendingWithdrawals() {
  try {
    const { rows } = await db.query(
      `SELECT COUNT(*)::int AS pending
         FROM withdrawal_requests
        WHERE status = 'PENDING'`,
    );

    const pending = rows[0]?.pending || 0;

    return {
      healthy: pending < 200,
      pending,
    };
  } catch (err) {
    return { healthy: false, error: err.message };
  }
}

async function checkSolanaIndexer() {
  try {
    const { rows } = await db.query(
      `SELECT last_processed_slot, updated_at
         FROM solana_indexer_checkpoints
        ORDER BY updated_at DESC
        LIMIT 1`,
    );

    const row = rows[0];

    if (!row) {
      return { healthy: true, status: 'NOT_INITIALIZED' };
    }

    const lastUpdated = new Date(row.updated_at).getTime();
    const stale = Date.now() - lastUpdated > 5 * 60 * 1000;

    return {
      healthy: !stale,
      lastProcessedSlot: row.last_processed_slot,
      lastUpdatedAt: row.updated_at,
      stale,
    };
  } catch (err) {
    return { healthy: false, error: err.message };
  }
}

export async function checkSystemHealth() {
  const checkedAt = nowIso();

  const [database, jobs, telegram, brokers, withdrawals, solana] = await Promise.all([
    checkDatabase(),
    checkJobQueue(),
    checkTelegramListeners(),
    checkBrokerConnections(),
    checkPendingWithdrawals(),
    checkSolanaIndexer(),
  ]);

  const components = {
    database,
    jobs,
    telegram,
    brokers,
    withdrawals,
    solana,
  };

  const allHealthy = Object.values(components).every((c) => c.healthy !== false);

  return {
    status: allHealthy ? 'HEALTHY' : 'DEGRADED',
    checkedAt,
    components,
  };
}

export async function getQuickHealthStatus() {
  const db = await checkDatabase();
  return {
    status: db.healthy ? 'OK' : 'DEGRADED',
    checkedAt: nowIso(),
    database: db,
  };
}

export const systemHealthService = {
  checkSystemHealth,
  getQuickHealthStatus,
};