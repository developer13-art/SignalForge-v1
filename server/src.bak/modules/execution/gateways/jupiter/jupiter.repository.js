'use strict';

const { query, transaction } = require('../../../../database/connection');
const { buildPagination } = require('../../../../database/helpers/pagination.helper');

/**
 * SignalForge - Jupiter Repository
 *
 * Persists Jupiter-specific state: quotes, swaps, and swap-route
 * metadata. Every swap submitted through the gateway produces exactly
 * one row so the execution path remains fully traceable.
 */

const TABLES = Object.freeze({
  QUOTES: 'solana_dex_quotes',
  SWAPS: 'solana_dex_swaps',
  ROUTES: 'solana_dex_routes',
});

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
      other_amount_threshold,
      slippage_bps,
      swap_mode,
      price_impact_pct,
      route_plan,
      raw_quote,
      expires_at,
      created_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15, $16, $17, NOW()
    )
    RETURNING *;
  `;

  const params = [
    payload.id,
    payload.userId || null,
    payload.accountId || null,
    payload.gateway || 'jupiter',
    payload.inputMint,
    payload.outputMint,
    payload.inputSymbol || null,
    payload.outputSymbol || null,
    payload.inAmount,
    payload.outAmount,
    payload.otherAmountThreshold || null,
    payload.slippageBps,
    payload.swapMode || 'ExactIn',
    payload.priceImpactPct || null,
    JSON.stringify(payload.routePlan || []),
    JSON.stringify(payload.rawQuote || {}),
    payload.expiresAt || null,
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

async function findLatestQuote({ userId, inputMint, outputMint }) {
  const sql = `
    SELECT * FROM ${TABLES.QUOTES}
    WHERE user_id = $1
      AND input_mint = $2
      AND output_mint = $3
    ORDER BY created_at DESC
    LIMIT 1;
  `;
  const result = await query(sql, [userId, inputMint, outputMint]);
  return result.rows[0] || null;
}

async function listQuotes({ userId, gateway, page = 1, pageSize = 20 }) {
  const conditions = [];
  const params = [];

  if (userId) {
    params.push(userId);
    conditions.push(`user_id = $${params.length}`);
  }
  if (gateway) {
    params.push(gateway);
    conditions.push(`gateway = $${params.length}`);
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
    payload.gateway || 'jupiter',
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

async function listSwaps({ userId, gateway, status, page = 1, pageSize = 20 }) {
  const conditions = [];
  const params = [];

  if (userId) {
    params.push(userId);
    conditions.push(`user_id = $${params.length}`);
  }
  if (gateway) {
    params.push(gateway);
    conditions.push(`gateway = $${params.length}`);
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
  const listResult = await query(sql, params);

  return { items: listResult.rows, total, page, pageSize };
}

async function countSwapsByStatus({ status, gateway } = {}) {
  const conditions = [];
  const params = [];

  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }
  if (gateway) {
    params.push(gateway);
    conditions.push(`gateway = $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const sql = `SELECT COUNT(*)::int AS total FROM ${TABLES.SWAPS} ${whereClause};`;
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
  createQuote,
  findQuoteById,
  findLatestQuote,
  listQuotes,
  createSwap,
  findSwapById,
  findSwapBySignature,
  updateSwapStatus,
  listSwaps,
  countSwapsByStatus,
  aggregateVolume,
  withTransaction,
};