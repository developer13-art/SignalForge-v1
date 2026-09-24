/**
 * Pool Helpers
 *
 * Higher-level pool utilities built on top of the connection module.
 * Provides a `.query()` wrapper that supports both parameterized
 * queries and configuration objects, plus common pool inspection
 * helpers.
 *
 * @module server/database/pool
 */

import { getPool } from './connection';
import { logger } from '../lib/logger';

export async function query(text, params) {
  const start = Date.now();
  const pool = getPool();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;

  logger.debug({ text, duration, rows: result.rowCount }, 'Query executed');

  return result;
}

export async function queryOne(text, params) {
  const result = await query(text, params);
  return result.rows[0] || null;
}

export async function queryAll(text, params) {
  const result = await query(text, params);
  return result.rows;
}

export async function queryCount(text, params) {
  const result = await query(text, params);
  return result.rows[0] ? Number(result.rows[0].count || result.rows[0].total || 0) : 0;
}

export async function batchQuery(queries) {
  if (!Array.isArray(queries) || queries.length === 0) {
    return [];
  }

  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const results = [];

    for (const { text, params } of queries) {
      const result = await client.query(text, params);
      results.push(result);
    }

    await client.query('COMMIT');
    return results;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export function getPoolStats() {
  const pool = getPool();
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  };
}

export const pool = {
  query,
  queryOne,
  queryAll,
  queryCount,
  batchQuery,
  getPoolStats,
};