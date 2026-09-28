'use strict';

const { query, transaction } = require('../../../database/connection');
const { buildPagination } = require('../../../database/helpers/pagination.helper');

/**
 * SignalForge - Crypto Symbol Repository
 *
 * Persists resolved crypto symbols so that repeated normalization
 * lookups are fast and auditable. Every resolved symbol receives a
 * stable internal identifier for use across the pipeline.
 */

const TABLES = Object.freeze({
  SYMBOLS: 'crypto_symbols',
  ALIASES: 'crypto_symbol_aliases',
});

async function upsertSymbol(client, payload) {
  const sql = `
    INSERT INTO ${TABLES.SYMBOLS} (
      id,
      canonical_symbol,
      base_asset,
      quote_asset,
      symbol_class,
      is_perp,
      is_swap,
      is_stable_pair,
      decimal_precision,
      price_precision,
      metadata,
      created_at,
      updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()
    )
    ON CONFLICT (canonical_symbol) DO UPDATE SET
      base_asset = EXCLUDED.base_asset,
      quote_asset = EXCLUDED.quote_asset,
      symbol_class = EXCLUDED.symbol_class,
      is_perp = EXCLUDED.is_perp,
      is_swap = EXCLUDED.is_swap,
      is_stable_pair = EXCLUDED.is_stable_pair,
      decimal_precision = EXCLUDED.decimal_precision,
      price_precision = EXCLUDED.price_precision,
      metadata = EXCLUDED.metadata,
      updated_at = NOW()
    RETURNING *;
  `;

  const params = [
    payload.id,
    payload.canonicalSymbol,
    payload.baseAsset,
    payload.quoteAsset,
    payload.symbolClass,
    payload.isPerp === true,
    payload.isSwap === true,
    payload.isStablePair === true,
    payload.decimalPrecision || null,
    payload.pricePrecision || null,
    JSON.stringify(payload.metadata || {}),
  ];

  const executor = client || { query: (text, values) => query(text, values) };
  const result = await executor.query(sql, params);
  return result.rows[0];
}

async function findSymbolByCanonical(canonicalSymbol) {
  const sql = `SELECT * FROM ${TABLES.SYMBOLS} WHERE canonical_symbol = $1 LIMIT 1;`;
  const result = await query(sql, [canonicalSymbol]);
  return result.rows[0] || null;
}

async function findSymbolById(id) {
  const sql = `SELECT * FROM ${TABLES.SYMBOLS} WHERE id = $1 LIMIT 1;`;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
}

async function upsertAlias(client, payload) {
  const sql = `
    INSERT INTO ${TABLES.ALIASES} (
      id,
      symbol_id,
      alias,
      normalized_alias,
      source,
      created_at
    ) VALUES (
      $1, $2, $3, $4, $5, NOW()
    )
    ON CONFLICT (normalized_alias) DO UPDATE SET
      symbol_id = EXCLUDED.symbol_id,
      source = EXCLUDED.source
    RETURNING *;
  `;

  const params = [
    payload.id,
    payload.symbolId,
    payload.alias,
    payload.normalizedAlias,
    payload.source || null,
  ];

  const executor = client || { query: (text, values) => query(text, values) };
  const result = await executor.query(sql, params);
  return result.rows[0];
}

async function findAlias(normalizedAlias) {
  const sql = `
    SELECT a.*, s.canonical_symbol, s.base_asset, s.quote_asset, s.symbol_class,
           s.is_perp, s.is_swap, s.is_stable_pair
    FROM ${TABLES.ALIASES} a
    JOIN ${TABLES.SYMBOLS} s ON s.id = a.symbol_id
    WHERE a.normalized_alias = $1
    LIMIT 1;
  `;
  const result = await query(sql, [normalizedAlias]);
  return result.rows[0] || null;
}

async function listSymbols({ symbolClass, page = 1, pageSize = 100 } = {}) {
  const conditions = [];
  const params = [];

  if (symbolClass) {
    params.push(symbolClass);
    conditions.push(`symbol_class = $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const { limit, offset } = buildPagination({ page, pageSize });

  const countSql = `SELECT COUNT(*)::int AS total FROM ${TABLES.SYMBOLS} ${whereClause};`;
  const countResult = await query(countSql, params);
  const total = countResult.rows[0]?.total || 0;

  params.push(limit);
  params.push(offset);

  const listSql = `
    SELECT * FROM ${TABLES.SYMBOLS}
    ${whereClause}
    ORDER BY canonical_symbol ASC
    LIMIT $${params.length - 1} OFFSET $${params.length};
  `;
  const listResult = await query(listSql, params);

  return { items: listResult.rows, total, page, pageSize };
}

async function countSymbols({ symbolClass } = {}) {
  const conditions = [];
  const params = [];

  if (symbolClass) {
    params.push(symbolClass);
    conditions.push(`symbol_class = $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const sql = `SELECT COUNT(*)::int AS total FROM ${TABLES.SYMBOLS} ${whereClause};`;
  const result = await query(sql, params);
  return result.rows[0]?.total || 0;
}

async function deleteOldAliases({ olderThanDays = 365 } = {}) {
  const sql = `
    DELETE FROM ${TABLES.ALIASES}
    WHERE created_at < NOW() - ($1 || ' days')::interval
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
  upsertSymbol,
  findSymbolByCanonical,
  findSymbolById,
  upsertAlias,
  findAlias,
  listSymbols,
  countSymbols,
  deleteOldAliases,
  withTransaction,
};