'use strict';

const { query, transaction } = require('../../../../database/connection');
const { buildPagination } = require('../../../../database/helpers/pagination.helper');

/**
 * SignalForge - Raydium Repository
 *
 * Persists Raydium-specific state: pools, quotes, and swaps. The
 * repository is intentionally independent from the shared DEX tables
 * to preserve gateway isolation.
 */

const TABLES = Object.freeze({
  POOLS: 'raydium_pools',
  QUOTES: 'raydium_quotes',
  SWAPS: 'raydium_swaps',
});

async function upsertPool(client, payload) {
  const sql = `
    INSERT INTO ${TABLES.POOLS} (
      id,
      pool_type,
      base_mint,
      quote_mint,
      base_symbol,
      quote_symbol,
      amm_id,
      lp_mint,
      price,
      liquidity_usd,
      volume_24h_usd,
      fee_rate,
      is_active,
      metadata,
      updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, $14, NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      pool_type = EXCLUDED.pool_type,
      base_mint = EXCLUDED.base_mint,
      quote_mint = EXCLUDED.quote_mint,
      base_symbol = EXCLUDED.base_symbol,
      quote_symbol = EXCLUDED.quote_symbol,
      amm_id = EXCLUDED.amm_id,
      lp_mint = EXCLUDED.lp_mint,
      price = EXCLUDED.price,
      liquidity_usd = EXCLUDED.liquidity_usd,
      volume_24h_usd = EXCLUDED.volume_24h_usd,
      fee_rate = EXCLUDED.fee_rate,
      is_active = EXCLUDED.is_active,
      metadata = EXCLUDED.metadata,
      updated_at = NOW()
    RETURNING *;
  `;

  const params = [
    payload.id,
    payload.poolType,
    payload.baseMint,
    payload.quoteMint,
    payload.baseSymbol || null,
    payload.quoteSymbol || null,
    payload.ammId || null,
    payload.lpMint || null,
    payload.price || null,
    payload.liquidityUsd || null,
    payload.volume24hUsd || null,
    payload.feeRate || null,
    payload.isActive !== false,
    JSON.stringify(payload.metadata || {}),
  ];

  const executor = client || { query: (text, values) => query(text, values) };
  const result = await executor.query(sql, params);
  return result.rows[0];
}

async function findPoolById(id) {
  const sql = `SELECT * FROM ${TABLES.POOLS} WHERE id = $1 LIMIT 1;`;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
}

async function findPoolByAmmId(ammId) {
  const sql = `SELECT * FROM ${TABLES.POOLS} WHERE amm_id = $1 LIMIT 1;`;
  const result = await query(sql, [ammId]);
  return result.rows[0] || null;
}

async function findPoolsByMints({ baseMint, quoteMint, poolType }) {
  const conditions = [
    '(base_mint = $1 AND quote_mint = $2) OR (base_mint = $2 AND quote_mint = $1)',
    'is_active = TRUE',
  ];
  const params = [baseMint, quoteMint];

  if (poolType) {
    params.push(poolType);
    conditions.push(`pool_type = $${params.length}`);
  }

  const sql = `
    SELECT * FROM ${TABLES.POOLS}
    WHERE ${conditions.join(' AND ')}
    ORDER BY liquidity_usd DESC NULLS LAST;
  `;
  const result = await query(sql, params);
  return result.rows;
}

async function listActivePools({ poolType, page = 1, pageSize = 50 } = {}) {
  const conditions = ['is_active = TRUE'];
  const params = [];

  if (poolType) {
    params.push(poolType);
    conditions.push(`pool_type = $${params.length}`);
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;
  const { limit, offset } = buildPagination({ page, pageSize });

  const countSql = `SELECT COUNT(*)::int AS total FROM ${TABLES.POOLS} ${whereClause};`;
  const countResult = await query(countSql, params);
  const total = countResult.rows[0]?.total || 0;

  params.push(limit);
  params.push(offset);

  const listSql = `
    SELECT * FROM ${TABLES.POOLS}
    ${whereClause}
    ORDER BY liquidity_usd DESC NULLS LAST
    LIMIT $${params.length - 1} OFFSET $${params.length};
  `;
  const listResult = await query(listSql, params);

  return { items: listResult.rows, total, page, pageSize };
}

async function markPoolInactive(ammId) {
  const sql = `
    UPDATE ${TABLES.POOLS}
    SET is_active = FALSE, updated_at = NOW()
    WHERE amm_id = $1
    RETURNING id;
  `;
  const result = await query(sql, [ammId]);
  return Boolean(result.rows[0]);
}

async function createQuote(client, payload) {
  const sql = `
    INSERT INTO ${TABLES.QUOTES} (
      id,
      user_id,
      account_id,
      gateway,
      input_mint,
      output_mint,
      input_symbol,
      output_symbol,
      in_amount,
      out_amount,
      min_out_amount,
      slippage_bps,
      price_impact_pct,
      pool_ids,
      raw_quote,
      created_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15, NOW()
    )
    RETURNING *;
  `;

  const params = [
    payload.id,
    payload.userId || null,
    payload.accountId || null,
    payload.gateway || 'raydium',
    payload.inputMint,
    payload.outputMint,
    payload.inputSymbol || null,
    payload.outputSymbol || null,
    payload.inAmount,
    payload.outAmount,
    payload.minOutAmount || null,
    payload.slippageBps,
    payload.priceImpactPct || null,
    JSON.stringify(payload.poolIds || []),
    JSON.stringify(payload.rawQuote || {}),
  ];

  const executor = client || { query: (text, values) => query(text, values) };
  const result = await executor.query(sql, params);
  return result.rows[0];
}

async function findQuoteById(id) {
  const sql = `SELECT * FROM ${TABLES.QUOTES} WHERE id = $1 LIMIT 1;`;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
}

async function listQuotes({ userId, page = 1, pageSize = 20 }) {
  const conditions = [];
  const params = [];

  if (userId) {
    params.push(userId);
    conditions.push(`user_id = $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const { limit, offset } = buildPagination({ page, pageSize });

  const countSql = `SELECT COUNT(*)::int AS total FROM ${TABLES.QUOTES} ${whereClause};`;
  const countResult = await query(countSql, params);
  const total = countResult.rows[0]?.total || 0;

  params.push(limit);
  params.push(offset);

  const listSql = `
    SELECT * FROM ${TABLES.QUOTES}
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${params.length - 1} OFFSET $${params.length};
  `;
  const listResult = await query(listSql, params);

  return { items: listResult.rows, total, page, pageSize };
}

async function createSwap(client, payload) {
  const sql = `
    INSERT INTO ${TABLES.SWAPS} (
      id,
      quote_id,
      user_id,
      account_id,
      gateway,
      input_mint,
      output_mint,
      in_amount,
      out_amount,
      slippage_bps,
      price_impact_pct,
      transaction_signature,
      status,
      block_slot,
      block_time,
      error_message,
      raw_response,
      submitted_at,
      confirmed_at,
      created_at,
      updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW(), NOW()
    )
    RETURNING *;
  `;

  const params = [
    payload.id,
    payload.quoteId || null,
    payload.userId || null,
    payload.accountId || null,
    payload.gateway || 'raydium',
    payload.inputMint,
    payload.outputMint,
    payload.inAmount,
    payload.outAmount,
    payload.slippageBps,
    payload.priceImpactPct || null,
    payload.transactionSignature || null,
    payload.status || 'pending',
    payload.blockSlot || null,
    payload.blockTime || null,
    payload.errorMessage || null,
    payload.rawResponse ? JSON.stringify(payload.rawResponse) : null,
    payload.submittedAt || null,
    payload.confirmedAt || null,
  ];

  const executor = client || { query: (text, values) => query(text, values) };
  const result = await executor.query(sql, params);
  return result.rows[0];
}

async function findSwapById(id) {
  const sql = `SELECT * FROM ${TABLES.SWAPS} WHERE id = $1 LIMIT 1;`;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
}

async function findSwapBySignature(signature) {
  const sql = `SELECT * FROM ${TABLES.SWAPS} WHERE transaction_signature = $1 LIMIT 1;`;
  const result = await query(sql, [signature]);
  return result.rows[0] || null;
}

async function updateSwapStatus(id, updates) {
  const columnMap = {
    status: 'status',
    transactionSignature: 'transaction_signature',
    blockSlot: 'block_slot',
    blockTime: 'block_time',
    errorMessage: 'error_message',
    rawResponse: 'raw_response',
    submittedAt: 'submitted_at',
    confirmedAt: 'confirmed_at',
  };

  const setClauses = ['updated_at = NOW()'];
  const params = [id];

  for (const [key, value] of Object.entries(updates || {})) {
    const column = columnMap[key];
    if (column && value !== undefined) {
      params.push(key === 'rawResponse' ? JSON.stringify(value) : value);
      setClauses.push(`${column} = $${params.length}`);
    }
  }

  const sql = `
    UPDATE ${TABLES.SWAPS}
    SET ${setClauses.join(', ')}
    WHERE id = $1
    RETURNING *;
  `;
  const result = await query(sql, params);
  return result.rows[0] || null;
}

async function listSwaps({ userId, status, page = 1, pageSize = 20 }) {
  const conditions = [];
  const params = [];

  if (userId) {
    params.push(userId);
    conditions.push(`user_id = $${params.length}`);
  }
  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const { limit, offset } = buildPagination({ page, pageSize });

  const countSql = `SELECT COUNT(*)::int AS total FROM ${TABLES.SWAPS} ${whereClause};`;
  const countResult = await query(countSql, params);
  const total = countResult.rows[0]?.total || 0;

  params.push(limit);
  params.push(offset);

  const listSql = `
    SELECT * FROM ${TABLES.SWAPS}
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${params.length - 1} OFFSET $${params.length};
  `;
  const listResult = await query(listSql, params);

  return { items: listResult.rows, total, page, pageSize };
}

async function countPools({ poolType } = {}) {
  const conditions = ['is_active = TRUE'];
  const params = [];
  if (poolType) {
    params.push(poolType);
    conditions.push(`pool_type = $${params.length}`);
  }
  const sql = `SELECT COUNT(*)::int AS total FROM ${TABLES.POOLS} WHERE ${conditions.join(' AND ')};`;
  const result = await query(sql, params);
  return result.rows[0]?.total || 0;
}

async function aggregateVolume({ userId, from, to } = {}) {
  const conditions = [];
  const params = [];

  if (userId) {
    params.push(userId);
    conditions.push(`user_id = $${params.length}`);
  }
  if (from) {
    params.push(from);
    conditions.push(`created_at >= $${params.length}`);
  }
  if (to) {
    params.push(to);
    conditions.push(`created_at <= $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const sql = `
    SELECT
      COUNT(*)::int AS total_swaps,
      SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END)::int AS confirmed_swaps,
      SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END)::int AS failed_swaps,
      COALESCE(SUM(CASE WHEN status = 'confirmed' THEN in_amount ELSE 0 END), 0) AS total_in_amount,
      COALESCE(SUM(CASE WHEN status = 'confirmed' THEN out_amount ELSE 0 END), 0) AS total_out_amount
    FROM ${TABLES.SWAPS}
    ${whereClause};
  `;
  const result = await query(sql, params);
  return result.rows[0] || {};
}

async function withTransaction(handler) {
  return transaction(async (client) => handler(client));
}

module.exports = {
  TABLES,
  upsertPool,
  findPoolById,
  findPoolByAmmId,
  findPoolsByMints,
  listActivePools,
  markPoolInactive,
  createQuote,
  findQuoteById,
  listQuotes,
  createSwap,
  findSwapById,
  findSwapBySignature,
  updateSwapStatus,
  listSwaps,
  countPools,
  aggregateVolume,
  withTransaction,
};