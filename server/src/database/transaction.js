/**
 * Transaction Helpers
 *
 * Provides safe transaction primitives used throughout the platform.
 * Every mutation that spans more than one write must go through one
 * of these helpers so that error handling, rollback, and release
 * semantics are consistent.
 *
 * @module server/database/transaction
 */

import { getPool } from './connection';
import { logger } from '../lib/logger';

export async function withTransaction(fn, options = {}) {
  const pool = getPool();
  const client = await pool.connect();

  const isolation = options.isolation || 'READ COMMITTED';

  try {
    await client.query(`BEGIN ISOLATION LEVEL ${isolation}`);
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackErr) {
      logger.error({ rollbackErr }, 'Rollback failed');
    }
    throw err;
  } finally {
    client.release();
  }
}

export async function withClient(fn) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    return await fn(client);
  } finally {
    client.release();
  }
}

export async function withSavepoint(client, name, fn) {
  if (!client || !name) {
    throw new Error('client and savepoint name are required');
  }

  const safeName = String(name).replace(/[^a-zA-Z0-9_]/g, '_');

  await client.query(`SAVEPOINT ${safeName}`);

  try {
    const result = await fn(client);
    await client.query(`RELEASE SAVEPOINT ${safeName}`);
    return result;
  } catch (err) {
    await client.query(`ROLLBACK TO SAVEPOINT ${safeName}`);
    throw err;
  }
}

export function createTransactionScope() {
  let client = null;
  let active = false;

  return {
    async begin() {
      if (active) {
        throw new Error('Transaction already active');
      }
      const pool = getPool();
      client = await pool.connect();
      await client.query('BEGIN');
      active = true;
    },
    async commit() {
      if (!active) {
        throw new Error('No active transaction');
      }
      await client.query('COMMIT');
      active = false;
      client.release();
      client = null;
    },
    async rollback() {
      if (!active) {
        return;
      }
      try {
        await client.query('ROLLBACK');
      } finally {
        active = false;
        client.release();
        client = null;
      }
    },
    get client() {
      return client;
    },
    get isActive() {
      return active;
    },
  };
}

export const transaction = {
  withTransaction,
  withClient,
  withSavepoint,
  createTransactionScope,
};