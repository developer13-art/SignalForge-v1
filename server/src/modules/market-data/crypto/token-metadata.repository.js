'use strict';

const { query, transaction } = require('../../../database/connection');
const { buildPagination } = require('../../../database/helpers/pagination.helper');

/**
 * SignalForge - Token Metadata Repository
 *
 * Persists token metadata for every SPL token SignalForge has
 * observed. Metadata is sourced from gateways and cached for fast
 * lookups.
 */

const TABLE = 'crypto_token_metadata';

async function upsertMetadata(client, payload) {
  const sql = `
    INSERT INTO ${TABLE} (
      mint,
      symbol,
      name,
      decimals,
      logo_uri,
      tags,
      is_verified,
      source,
      source_reference,
      metadata,
      created_at,
      updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      NOW(), NOW()
    )
    ON CONFLICT (mint) DO UPDATE SET
      symbol = EXCLUDED.symbol,
      name = EXCLUDED.name,
      decimals = EXCLUDED.decimals,
      logo_uri = EXCLUDED.logo_uri,
      tags = EXCLUDED.tags,
      is_verified = EXCLUDED.is_verified,
      source = EXCLUDED.source,
      source_reference = EXCLUDED.source_reference,
      metadata = EXCLUDED.metadata,
      updated_at = NOW()
    RETURNING *;
  `;

  const params = [
    payload.mint,
    payload.symbol || null,
    payload.name || null,
    payload.decimals ?? null,
    payload.logoUri || null,
    payload.tags ? JSON.stringify(payload.tags) : null,
    payload.isVerified === true,
    payload.source || null,
    payload.sourceReference || null,
    JSON.stringify(payload.metadata || {}),
  ];

  const executor = client || { query: (text, values) => query(text, values) };
  const result = await executor.query(sql, params);
  return result.rows[0];
}

async function findByMint(mint) {
  const sql = `SELECT * FROM ${TABLE} WHERE mint = $1 LIMIT 1;`;
  const result = await query(sql, [mint]);
  return result.rows[0] || null;
}

async function findBySymbol(symbol) {
  const sql = `
    SELECT * FROM ${TABLE}
    WHERE symbol = $1
    ORDER BY is_verified DESC NULLS LAST
    LIMIT 1;
  `;
  const result = await query(sql, [symbol]);
  return result.rows[0] || null;
}

async function listByTag({ tag, page = 1, pageSize = 100 } = {}) {
  if (!tag) {
    throw new Error('tag is required');
  }

  const { limit, offset } = buildPagination({ page, pageSize });

  const countSql = `
    SELECT COUNT(*)::int AS total
    FROM ${TABLE}
    WHERE tags @> $1::jsonb;
  `;
  const countResult = await query(countSql, [JSON.stringify([tag])]);
  const total = countResult.rows[0]?.total || 0;

  const listSql = `
    SELECT * FROM ${TABLE}
    WHERE tags @> $1::jsonb
    ORDER BY symbol ASC
    LIMIT $2 OFFSET $3;
  `;
  const listResult = await query(listSql, [JSON.stringify([tag]), limit, offset]);

  return { items: listResult.rows, total, page, pageSize };
}

async function list({ page = 1, pageSize = 100 } = {}) {
  const { limit, offset } = buildPagination({ page, pageSize });

  const countSql = `SELECT COUNT(*)::int AS total FROM ${TABLE};`;
  const countResult = await query(countSql);
  const total = countResult.rows[0]?.total || 0;

  const listSql = `
    SELECT * FROM ${TABLE}
    ORDER BY is_verified DESC NULLS LAST, symbol ASC
    LIMIT $1 OFFSET $2;
  `;
  const listResult = await query(listSql, [limit, offset]);

  return { items: listResult.rows, total, page, pageSize };
}

async function countBySource() {
  const sql = `
    SELECT source, COUNT(*)::int AS tokens
    FROM ${TABLE}
    GROUP BY source
    ORDER BY tokens DESC;
  `;
  const result = await query(sql);
  return result.rows;
}

async function withTransaction(handler) {
  return transaction(async (client) => handler(client));
}

module.exports = {
  TABLE,
  upsertMetadata,
  findByMint,
  findBySymbol,
  listByTag,
  list,
  countBySource,
  withTransaction,
};