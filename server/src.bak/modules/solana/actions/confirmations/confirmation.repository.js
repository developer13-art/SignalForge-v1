'use strict';

const { query } = require('../../../../database/connection');
const { buildPagination } = require('../../../../database/helpers/pagination.helper');

/**
 * SignalForge - Confirmation Repository
 *
 * Persistence for Blink conversion confirmations. Every confirmation
 * row records the raw on-chain facts (slot, blockTime, status) and
 * links back to the conversion and subscription it produced.
 */

const TABLES = Object.freeze({
  CONFIRMATIONS: 'solana_actions_confirmations',
  CONVERSIONS: 'solana_blink_conversions',
  RECEIPTS: 'solana_blink_receipts',
});

async function createConfirmation(client, payload) {
  const sql = `
    INSERT INTO ${TABLES.CONFIRMATIONS} (
      id,
      blink_id,
      conversion_id,
      signature,
      reference,
      wallet,
      amount,
      token_symbol,
      token_mint,
      status,
      block_slot,
      block_time,
      commitment,
      error_message,
      raw_payload,
      created_at,
      updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15, NOW(), NOW()
    )
    RETURNING *;
  `;

  const params = [
    payload.id,
    payload.blinkId,
    payload.conversionId || null,
    payload.signature,
    payload.reference || null,
    payload.wallet,
    payload.amount || null,
    payload.tokenSymbol || null,
    payload.tokenMint || null,
    payload.status || 'pending',
    payload.blockSlot || null,
    payload.blockTime || null,
    payload.commitment || 'confirmed',
    payload.errorMessage || null,
    payload.rawPayload ? JSON.stringify(payload.rawPayload) : JSON.stringify({}),
  ];

  const executor = client || { query: (text, values) => query(text, values) };
  const result = await executor.query(sql, params);
  return result.rows[0];
}

async function findById(id) {
  const sql = `SELECT * FROM ${TABLES.CONFIRMATIONS} WHERE id = $1 LIMIT 1;`;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
}

async function findBySignature(signature) {
  const sql = `SELECT * FROM ${TABLES.CONFIRMATIONS} WHERE signature = $1 LIMIT 1;`;
  const result = await query(sql, [signature]);
  return result.rows[0] || null;
}

async function findByReference(reference) {
  const sql = `SELECT * FROM ${TABLES.CONFIRMATIONS} WHERE reference = $1 LIMIT 1;`;
  const result = await query(sql, [reference]);
  return result.rows[0] || null;
}

async function findByConversion(conversionId) {
  const sql = `SELECT * FROM ${TABLES.CONFIRMATIONS} WHERE conversion_id = $1 LIMIT 1;`;
  const result = await query(sql, [conversionId]);
  return result.rows[0] || null;
}

async function updateStatus(id, { status, blockSlot, blockTime, commitment, errorMessage, rawPayload }) {
  const setClauses = ['status = $2', 'updated_at = NOW()'];
  const params = [id, status];

  if (blockSlot !== undefined) {
    params.push(blockSlot);
    setClauses.push(`block_slot = $${params.length}`);
  }
  if (blockTime !== undefined) {
    params.push(blockTime);
    setClauses.push(`block_time = $${params.length}`);
  }
  if (commitment !== undefined) {
    params.push(commitment);
    setClauses.push(`commitment = $${params.length}`);
  }
  if (errorMessage !== undefined) {
    params.push(errorMessage);
    setClauses.push(`error_message = $${params.length}`);
  }
  if (rawPayload !== undefined) {
    params.push(JSON.stringify(rawPayload));
    setClauses.push(`raw_payload = $${params.length}`);
  }

  const sql = `
    UPDATE ${TABLES.CONFIRMATIONS}
    SET ${setClauses.join(', ')}
    WHERE id = $1
    RETURNING *;
  `;

  const result = await query(sql, params);
  return result.rows[0] || null;
}

async function listPending({ commitment, olderThanMs, limit = 50 } = {}) {
  const conditions = ["status IN ('pending', 'processing')"];
  const params = [];

  if (commitment) {
    params.push(commitment);
    conditions.push(`commitment = $${params.length}`);
  }

  if (olderThanMs) {
    const threshold = new Date(Date.now() - olderThanMs).toISOString();
    params.push(threshold);
    conditions.push(`created_at <= $${params.length}`);
  }

  params.push(limit);

  const sql = `
    SELECT * FROM ${TABLES.CONFIRMATIONS}
    WHERE ${conditions.join(' AND ')}
    ORDER BY created_at ASC
    LIMIT $${params.length};
  `;

  const result = await query(sql, params);
  return result.rows;
}

async function listByWallet({ wallet, page = 1, pageSize = 20 }) {
  const { limit, offset } = buildPagination({ page, pageSize });

  const countSql = `SELECT COUNT(*)::int AS total FROM ${TABLES.CONFIRMATIONS} WHERE wallet = $1;`;
  const countResult = await query(countSql, [wallet]);
  const total = countResult.rows[0]?.total || 0;

  const listSql = `
    SELECT * FROM ${TABLES.CONFIRMATIONS}
    WHERE wallet = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3;
  `;
  const listResult = await query(listSql, [wallet, limit, offset]);

  return {
    items: listResult.rows,
    total,
    page,
    pageSize,
  };
}

async function listByBlink({ blinkId, page = 1, pageSize = 20 }) {
  const { limit, offset } = buildPagination({ page, pageSize });

  const countSql = `SELECT COUNT(*)::int AS total FROM ${TABLES.CONFIRMATIONS} WHERE blink_id = $1;`;
  const countResult = await query(countSql, [blinkId]);
  const total = countResult.rows[0]?.total || 0;

  const listSql = `
    SELECT * FROM ${TABLES.CONFIRMATIONS}
    WHERE blink_id = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3;
  `;
  const listResult = await query(listSql, [blinkId, limit, offset]);

  return {
    items: listResult.rows,
    total,
    page,
    pageSize,
  };
}

async function aggregateByStatus({ blinkId } = {}) {
  const conditions = [];
  const params = [];

  if (blinkId) {
    params.push(blinkId);
    conditions.push(`blink_id = $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const sql = `
    SELECT
      status,
      COUNT(*)::int AS total,
      COALESCE(SUM(amount), 0) AS total_amount
    FROM ${TABLES.CONFIRMATIONS}
    ${whereClause}
    GROUP BY status;
  `;

  const result = await query(sql, params);
  return result.rows;
}

async function deleteOldConfirmations({ olderThanDays = 90 } = {}) {
  const sql = `
    DELETE FROM ${TABLES.CONFIRMATIONS}
    WHERE created_at < NOW() - ($1 || ' days')::interval
      AND status IN ('failed', 'expired')
    RETURNING id;
  `;
  const result = await query(sql, [String(olderThanDays)]);
  return result.rowCount;
}

module.exports = {
  TABLES,
  createConfirmation,
  findById,
  findBySignature,
  findByReference,
  findByConversion,
  updateStatus,
  listPending,
  listByWallet,
  listByBlink,
  aggregateByStatus,
  deleteOldConfirmations,
};