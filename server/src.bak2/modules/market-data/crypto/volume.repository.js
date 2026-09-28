'use strict';

const { query, transaction } = require('../../../database/connection');

/**
 * SignalForge - Volume Repository
 *
 * Persists rolling volume aggregates per symbol and window. Volume is
 * important for sizing decisions and for detecting unusual market
 * activity.
 */

const TABLES = Object.freeze({
  ROLLUP: 'crypto_volume_rollups',
});

async function upsertRollup(client, payload) {
  const sql = `
    INSERT INTO ${TABLES.ROLLUP} (
      canonical_symbol,
      window,
      volume_quote,
      volume_base,
      trades_count,
      window_start,
      window_end,
      fetched_at,
      metadata
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, NOW(), $8
    )
    ON CONFLICT (canonical_symbol, window) DO UPDATE SET
      volume_quote = EXCLUDED.volume_quote,
      volume_base = EXCLUDED.volume_base,
      trades_count = EXCLUDED.trades_count,
      window_start = EXCLUDED.window_start,
      window_end = EXCLUDED.window_end,
      fetched_at = NOW(),
      metadata = EXCLUDED.metadata
    RETURNING *;
  `;

  const params = [
    payload.canonicalSymbol,
    payload.window,
    payload.volumeQuote,
    payload.volumeBase || null,
    payload.tradesCount || 0,
    payload.windowStart,
    payload.windowEnd,
    JSON.stringify(payload.metadata || {}),
  ];

  const executor = client || { query: (text, values) => query(text, values) };
  const result = await executor.query(sql, params);
  return result.rows[0];
}

async function findRollup({ canonicalSymbol, window }) {
  const sql = `
    SELECT * FROM ${TABLES.ROLLUP}
    WHERE canonical_symbol = $1 AND window = $2
    LIMIT 1;
  `;
  const result = await query(sql, [canonicalSymbol, window]);
  return result.rows[0] || null;
}

async function listRollups(canonicalSymbol) {
  const sql = `
    SELECT * FROM ${TABLES.ROLLUP}
    WHERE canonical_symbol = $1
    ORDER BY window ASC;
  `;
  const result = await query(sql, [canonicalSymbol]);
  return result.rows;
}

async function listTopByVolume({ window, limit = 20 } = {}) {
  const sql = `
    SELECT * FROM ${TABLES.ROLLUP}
    WHERE window = $1
    ORDER BY volume_quote DESC NULLS LAST
    LIMIT $2;
  `;
  const result = await query(sql, [window, limit]);
  return result.rows;
}

async function deleteOldRollups({ olderThanDays = 30 } = {}) {
  const sql = `
    DELETE FROM ${TABLES.ROLLUP}
    WHERE fetched_at < NOW() - ($1 || ' days')::interval
    RETURNING canonical_symbol;
  `;
  const result = await query(sql, [String(olderThanDays)]);
  return result.rowCount;
}

async function withTransaction(handler) {
  return transaction(async (client) => handler(client));
}

module.exports = {
  TABLES,
  upsertRollup,
  findRollup,
  listRollups,
  listTopByVolume,
  deleteOldRollups,
  withTransaction,
};