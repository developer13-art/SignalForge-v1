'use strict';

const { query, transaction } = require('../../../database/connection');
const { buildPagination } = require('../../../database/helpers/pagination.helper');

/**
 * SignalForge - Price Feed Repository
 *
 * Persists price snapshots so that pricing is auditable and so that
 * analytics can reconstruct historical prices without relying on
 * external providers.
 */

const TABLES = Object.freeze({
  SNAPSHOTS: 'crypto_price_snapshots',
  LATEST: 'crypto_price_latest',
});

async function insertSnapshot(client, payload) {
  const sql = `
    INSERT INTO ${TABLES.SNAPSHOTS} (
      id,
      canonical_symbol,
      base_asset,
      quote_asset,
      price,
      source,
      source_symbol,
      bid,
      ask,
      mid,
      volume_24h_usd,
      liquidity_usd,
      source_timestamp,
      fetched_at,
      metadata
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, NOW(), $14
    )
    RETURNING *;
  `;

  const params = [
    payload.id,
    payload.canonicalSymbol,
    payload.baseAsset || null,
    payload.quoteAsset || null,
    payload.price,
    payload.source,
    payload.sourceSymbol || null,
    payload.bid || null,
    payload.ask || null,
    payload.mid || null,
    payload.volume24hUsd || null,
    payload.liquidityUsd || null,
    payload.sourceTimestamp || null,
    JSON.stringify(payload.metadata || {}),
  ];

  const executor = client || { query: (text, values) => query(text, values) };
  const result = await executor.query(sql, params);
  return result.rows[0];
}

async function upsertLatest(client, payload) {
  const sql = `
    INSERT INTO ${TABLES.LATEST} (
      canonical_symbol,
      base_asset,
      quote_asset,
      price,
      source,
      source_symbol,
      bid,
      ask,
      mid,
      volume_24h_usd,
      liquidity_usd,
      source_timestamp,
      fetched_at,
      metadata
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, NOW(), $13
    )
    ON CONFLICT (canonical_symbol) DO UPDATE SET
      price = EXCLUDED.price,
      source = EXCLUDED.source,
      source_symbol = EXCLUDED.source_symbol,
      bid = EXCLUDED.bid,
      ask = EXCLUDED.ask,
      mid = EXCLUDED.mid,
      volume_24h_usd = EXCLUDED.volume_24h_usd,
      liquidity_usd = EXCLUDED.liquidity_usd,
      source_timestamp = EXCLUDED.source_timestamp,
      fetched_at = NOW(),
      metadata = EXCLUDED.metadata
    RETURNING *;
  `;

  const params = [
    payload.canonicalSymbol,
    payload.baseAsset || null,
    payload.quoteAsset || null,
    payload.price,
    payload.source,
    payload.sourceSymbol || null,
    payload.bid || null,
    payload.ask || null,
    payload.mid || null,
    payload.volume24hUsd || null,
    payload.liquidityUsd || null,
    payload.sourceTimestamp || null,
    JSON.stringify(payload.metadata || {}),
  ];

  const executor = client || { query: (text, values) => query(text, values) };
  const result = await executor.query(sql, params);
  return result.rows[0];
}

async function findLatest(canonicalSymbol) {
  const sql = `SELECT * FROM ${TABLES.LATEST} WHERE canonical_symbol = $1 LIMIT 1;`;
  const result = await query(sql, [canonicalSymbol]);
  return result.rows[0] || null;
}

async function listLatest(canonicalSymbols) {
  if (!Array.isArray(canonicalSymbols) || canonicalSymbols.length === 0) {
    return [];
  }
  const sql = `
    SELECT * FROM ${TABLES.LATEST}
    WHERE canonical_symbol = ANY($1::text[]);
  `;
  const result = await query(sql, [canonicalSymbols]);
  return result.rows;
}

async function listSnapshots({ canonicalSymbol, from, to, page = 1, pageSize = 100 }) {
  const conditions = [];
  const params = [];

  if (canonicalSymbol) {
    params.push(canonicalSymbol);
    conditions.push(`canonical_symbol = $${params.length}`);
  }
  if (from) {
    params.push(from);
    conditions.push(`fetched_at >= $${params.length}`);
  }
  if (to) {
    params.push(to);
    conditions.push(`fetched_at <= $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const { limit, offset } = buildPagination({ page, pageSize });

  const countSql = `SELECT COUNT(*)::int AS total FROM ${TABLES.SNAPSHOTS} ${whereClause};`;
  const countResult = await query(countSql, params);
  const total = countResult.rows[0]?.total || 0;

  params.push(limit);
  params.push(offset);

  const listSql = `
    SELECT * FROM ${TABLES.SNAPSHOTS}
    ${whereClause}
    ORDER BY fetched_at DESC
    LIMIT $${params.length - 1} OFFSET $${params.length};
  `;
  const listResult = await query(listSql, params);

  return { items: listResult.rows, total, page, pageSize };
}

async function countSnapshots({ canonicalSymbol, from, to } = {}) {
  const conditions = [];
  const params = [];

  if (canonicalSymbol) {
    params.push(canonicalSymbol);
    conditions.push(`canonical_symbol = $${params.length}`);
  }
  if (from) {
    params.push(from);
    conditions.push(`fetched_at >= $${params.length}`);
  }
  if (to) {
    params.push(to);
    conditions.push(`fetched_at <= $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const sql = `SELECT COUNT(*)::int AS total FROM ${TABLES.SNAPSHOTS} ${whereClause};`;
  const result = await query(sql, params);
  return result.rows[0]?.total || 0;
}

async function deleteOldSnapshots({ olderThanDays = 90 } = {}) {
  const sql = `
    DELETE FROM ${TABLES.SNAPSHOTS}
    WHERE fetched_at < NOW() - ($1 || ' days')::interval
    RETURNING id;
  `;
  const result = await query(sql, [String(olderThanDays)]);
  return result.rowCount;
}

async function aggregateVolatility({ canonicalSymbol, from, to }) {
  const sql = `
    SELECT
      MIN(price) AS min_price,
      MAX(price) AS max_price,
      AVG(price) AS avg_price,
      STDDEV(price) AS stddev_price,
      COUNT(*)::int AS samples
    FROM ${TABLES.SNAPSHOTS}
    WHERE canonical_symbol = $1
      AND fetched_at >= $2
      AND fetched_at <= $3;
  `;
  const result = await query(sql, [canonicalSymbol, from, to]);
  return result.rows[0] || {};
}

async function withTransaction(handler) {
  return transaction(async (client) => handler(client));
}

module.exports = {
  TABLES,
  insertSnapshot,
  upsertLatest,
  findLatest,
  listLatest,
  listSnapshots,
  countSnapshots,
  deleteOldSnapshots,
  aggregateVolatility,
  withTransaction,
};