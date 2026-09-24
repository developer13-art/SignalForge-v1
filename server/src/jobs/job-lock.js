/**
 * Job Lock
 *
 * Provides a distributed lock backed by PostgreSQL advisory locks.
 * Used to guarantee that only one worker processes a given job.
 *
 * @module server/jobs/job-lock
 */

import { getPool } from '../database/connection';
import { logger } from '../lib/logger';

export async function acquireLock({ lockKey }) {
  if (!lockKey) {
    throw new Error('lockKey is required');
  }

  const pool = getPool();
  const client = await pool.connect();

  const { rows } = await client.query(
    `SELECT pg_try_advisory_lock($1) AS acquired`,
    [lockKey],
  );

  const acquired = rows[0] && rows[0].acquired === true;

  if (!acquired) {
    client.release();
    return { acquired: false, client: null };
  }

  return { acquired: true, client };
}

export async function releaseLock({ lockKey, client }) {
  if (!lockKey || !client) {
    return { released: false };
  }

  try {
    await client.query(`SELECT pg_advisory_unlock($1)`, [lockKey]);
    logger.debug({ lockKey }, 'Advisory lock released');
    return { released: true };
  } finally {
    client.release();
  }
}

export async function withJobLock({ lockKey, fn }) {
  if (!lockKey || typeof fn !== 'function') {
    throw new Error('lockKey and fn are required');
  }

  const { acquired, client } = await acquireLock({ lockKey });

  if (!acquired) {
    return { acquired: false };
  }

  try {
    const result = await fn();
    return { acquired: true, result };
  } finally {
    await releaseLock({ lockKey, client });
  }
}

export const jobLock = {
  acquireLock,
  releaseLock,
  withJobLock,
};