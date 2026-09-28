'use strict';

const { query, transaction } = require('../../../database/connection');
const { buildPagination } = require('../../../database/helpers/pagination.helper');

/**
 * SignalForge - Pool Registry Repository
 *
 * Persists every pool SignalForge has ever observed across the
 * supported DEXes. The registry is the canonical source of truth for
 * pool metadata such as mint pairs, tick spacing, fee rates, and
 * the DEX that hosts the pool.
 */

const TABLE = 'crypto_pools';

async function upsertPool(client, payload) {
  const sql = `
    INSERT INTO ${TABLE} (
      id,
      source,
      pool_type,
      address,
      base_mint,
      quote_mint,
      base_symbol,
      quote_symbol,
      tick_spacing,
      fee_rate,
      lp_mint,
      is_active,
      metadata,
      created_at,
      updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, NOW(), NOW()
    )
    ON CONFLICT (source, address) DO UPDATE SET
      pool_type = EXCLUDED.pool_type,
      base_mint = EXCLUDED.base_mint,
      quote_mint = EXCLUDED.quote_mint,
      base_symbol = EXCLUDED.base_symbol,
      quote_symbol = EXCLUDED.quote_symbol,
      tick_spacing = EXCLUDED.tick_spacing,
      fee_rate = EXCLUDED.fee_rate,
      lp_mint = EXCLUDED.lp_mint,
      is_active = EXCLUDED.is_active,
      metadata = EXCLUDED.metadata,
      updated_at = NOW()
    RETURNING *;
  `;

  const params = [
    payload.id,
    payload.source,
    payload.poolType || null,
    payload.address,
    payload.baseMint,
    payload.quoteMint,
    payload.baseSymbol || null,
    payload.quoteSymbol || null,
    payload.tickSpacing || null,
    payload.feeRate || null,
    payload.lpMint || null,
    payload.isActive !== false,
    JSON.stringify(payload.metadata || {}),
  ];

  const executor = client || { query: (text, values) => query(text, values) };
  const result = await executor.query(sql, params);
  return result.rows[0];
}

async function findPoolByAddress({ source, address }) {
  const sql = `SELECT * FROM ${TABLE} WHERE source = $1 AND address = $2 LIMIT 1;`;
  const result = await query(sql, [source, address]);
  return result.rows[0] || null;
}

async function findPoolsByMints({ baseMint, quoteMint, source }) {
  const conditions = [
    '(base_mint = $1 AND quote_mint = $2) OR (base_mint = $2 AND quote_mint = $1)',
    'is_active = TRUE',
  ];
  const params = [baseMint, quoteMint];

  if (source) {
    params.push(source);
    conditions.push(`source = $${params.length}`);
  }

  const sql = `
    SELECT * FROM ${TABLE}
    WHERE ${conditions.join(' AND ')}
    ORDER BY source ASC;
  `;
  const result = await query(sql, params);
  return result.rows;
}

async function listActive({ source, poolType, page = 1, pageSize = 100 } = {}) {
  const conditions = ['is_active = TRUE'];
  const params = [];

  if (source) {
    params.push(source);
    conditions.push(`source = $${params.length}`);
  }
  if (poolType) {
    params.push(poolType);
    conditions.push(`pool_type = $${params.length}`);
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;
  const { limit, offset } = buildPagination({ page, pageSize });

  const countSql = `SELECT COUNT(*)::int AS total FROM ${TABLE} ${whereClause};`;
  const countResult = await query(countSql, params);
  const total = countResult.rows[0]?.total || 0;

  params.push(limit);
  params.push(offset);

  const listSql = `
    SELECT * FROM ${TABLE}
    ${whereClause}
    ORDER BY source ASC, base_symbol ASC, quote_symbol ASC
    LIMIT $${params.length - 1} OFFSET $${params.length};
  `;
  const listResult = await query(listSql, params);

  return { items: listResult.rows, total, page, pageSize };
}

async function countBySource() {
  const sql = `
    SELECT source, COUNT(*)::int AS pools
    FROM ${TABLE}
    WHERE is_active = TRUE
    GROUP BY source
    ORDER BY pools DESC;
  `;
  const result = await query(sql);
  return result.rows;
}

async function markInactive({ source, address }) {
  const sql = `
    UPDATE ${TABLE}
    SET is_active = FALSE, updated_at = NOW()
    WHERE source = $1 AND address = $2
    RETURNING id;
  `;
  const result = await query(sql, [source, address]);
  return Boolean(result.rows[0]);
}

async function withTransaction(handler) {
  return transaction(async (client) => handler(client));
}

module.exports = {
  TABLE,
  upsertPool,
  findPoolByAddress,
  findPoolsByMints,
  listActive,
  countBySource,
  markInactive,
  withTransaction,
};