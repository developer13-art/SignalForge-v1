'use strict';

const { query, transaction } = require('../../../database/connection');
const { buildPagination } = require('../../../database/helpers/pagination.helper');

/**
 * SignalForge - Liquidity Repository
 *
 * Persists liquidity snapshots per pool so that the platform can
 * reconstruct depth over time and identify liquidity migrations.
 */

const TABLES = Object.freeze({
  SNAPSHOTS: 'crypto_liquidity_snapshots',
  LATEST: 'crypto_liquidity_latest',
});

async function insertSnapshot(client, payload) {
  const sql = `
    INSERT INTO ${TABLES.SNAPSHOTS} (
      id,
      pool_id,
      source,
      base_mint,
      quote_mint,
      canonical_symbol,
      liquidity_usd,
      reserve_base,
      reserve_quote,
      fee_rate,
      tier,
      source_timestamp,
      fetched_at,
      metadata
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, NOW(), $13
    )
    RETURNING *;
  `;

  const params = [
    payload.id,
    payload.poolId,
    payload.source,
    payload.baseMint || null,
    payload.quoteMint || null,
    payload.canonicalSymbol || null,
    payload.liquidityUsd,
    payload.reserveBase || null,
    payload.reserveQuote || null,
    payload.feeRate || null,
    payload.tier || null,
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
      pool_id,
      source,
      base_mint,
      quote_mint,
      canonical_symbol,
      liquidity_usd,
      reserve_base,
      reserve_quote,
      fee_rate,
      tier,
      source_timestamp,
      fetched_at,
      metadata
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, NOW(), $12
    )
    ON CONFLICT (pool_id) DO UPDATE SET
      source = EXCLUDED.source,
      liquidity_usd = EXCLUDED.liquidity_usd,
      reserve_base = EXCLUDED.reserve_base,
      reserve_quote = EXCLUDED.reserve_quote,
      fee_rate = EXCLUDED.fee_rate,
      tier = EXCLUDED.tier,
      source_timestamp = EXCLUDED.source_timestamp,
      fetched_at = NOW(),
      metadata = EXCLUDED.metadata
    RETURNING *;
  `;

  const params = [
    payload.poolId,
    payload.source,
    payload.baseMint || null,
    payload.quoteMint || null,
    payload.canonicalSymbol || null,
    payload.liquidityUsd,
    payload.reserveBase || null,
    payload.reserveQuote || null,
    payload.feeRate || null,
    payload.tier || null,
    payload.sourceTimestamp || null,
    JSON.stringify(payload.metadata || {}),
  ];

  const executor = client || { query: (text, values) => query(text, values) };
  const result = await executor.query(sql, params);
  return result.rows[0];
}

async function findLatestByPool(poolId) {
  const sql = `SELECT * FROM ${TABLES.LATEST} WHERE pool_id = $1 LIMIT 1;`;
  const result = await query(sql, [poolId]);
  return result.rows[0] || null;
}

async function listLatestBySymbol(canonicalSymbol) {
  const sql = `
    SELECT * FROM ${TABLES.LATEST}
    WHERE canonical_symbol = $1
    ORDER BY liquidity_usd DESC NULLS LAST;
  `;
  const result = await query(sql, [canonicalSymbol]);
  return result.rows;
}

async function listSnapshots({ poolId, from, to, page = 1, pageSize = 100 }) {
  const conditions = [];
  const params = [];

  if (poolId) {
    params.push(poolId);
    conditions.push(`pool_id = $${params.length}`);
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

async function aggregateLiquidityByTier() {
  const sql = `
    SELECT tier, COUNT(*)::int AS pools, COALESCE(SUM(liquidity_usd), 0) AS total_liquidity_usd
    FROM ${TABLES.LATEST}
    GROUP BY tier
    ORDER BY total_liquidity_usd DESC;
  `;
  const result = await query(sql);
  return result.rows;
}

async function deleteOldSnapshots({ olderThanDays = 30 } = {}) {
  const sql = `
    DELETE FROM ${TABLES.SNAPSHOTS}
    WHERE fetched_at < NOW() - ($1 || ' days')::interval
    RETURNING id;
  `;
  const result = await query(sql, [String(olderThanDays)]);
  return result.rowCount;
}

async function withTransaction(handler) {
  return transaction(async (client) => handler(client));
}

module.exports = {
  TABLES,
  insertSnapshot,
  upsertLatest,
  findLatestByPool,
  listLatestBySymbol,
  listSnapshots,
  aggregateLiquidityByTier,
  deleteOldSnapshots,
  withTransaction,
};