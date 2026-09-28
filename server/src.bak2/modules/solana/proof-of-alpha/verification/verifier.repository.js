'use strict';

const { query, transaction } = require('../../../../database/connection');
const { buildPagination } = require('../../../../database/helpers/pagination.helper');

/**
 * SignalForge - Verifier Repository
 *
 * Persistence for verification records. Each verification is a single
 * evaluation of a proof (or of a raw signature) against the on-chain
 * state. Verifications are additive; existing rows are never updated
 * so the audit trail remains linear.
 */

const TABLE = 'solana_proof_verifications';

async function createVerification(client, payload) {
  const sql = `
    INSERT INTO ${TABLE} (
      id,
      proof_id,
      signature,
      provider_id,
      trade_id,
      level,
      valid,
      memo_hash,
      on_chain_hash,
      matches,
      verifier,
      reason,
      raw_response,
      created_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, NOW()
    )
    RETURNING *;
  `;

  const params = [
    payload.id,
    payload.proofId || null,
    payload.signature,
    payload.providerId || null,
    payload.tradeId || null,
    payload.level || 'verified',
    payload.valid === true,
    payload.memoHash || null,
    payload.onChainHash || null,
    payload.matches === true,
    payload.verifier || 'signalforge',
    payload.reason || null,
    payload.rawResponse ? JSON.stringify(payload.rawResponse) : null,
  ];

  const executor = client || { query: (text, values) => query(text, values) };
  const result = await executor.query(sql, params);
  return result.rows[0];
}

async function findById(id) {
  const sql = `SELECT * FROM ${TABLE} WHERE id = $1 LIMIT 1;`;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
}

async function findBySignature(signature) {
  const sql = `
    SELECT * FROM ${TABLE}
    WHERE signature = $1
    ORDER BY created_at DESC
    LIMIT 1;
  `;
  const result = await query(sql, [signature]);
  return result.rows[0] || null;
}

async function listBySignature(signature) {
  const sql = `
    SELECT * FROM ${TABLE}
    WHERE signature = $1
    ORDER BY created_at DESC;
  `;
  const result = await query(sql, [signature]);
  return result.rows;
}

async function listByProof(proofId, { page = 1, pageSize = 20 } = {}) {
  const { limit, offset } = buildPagination({ page, pageSize });

  const countSql = `SELECT COUNT(*)::int AS total FROM ${TABLE} WHERE proof_id = $1;`;
  const countResult = await query(countSql, [proofId]);
  const total = countResult.rows[0]?.total || 0;

  const listSql = `
    SELECT * FROM ${TABLE}
    WHERE proof_id = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3;
  `;
  const listResult = await query(sql, [proofId, limit, offset]);

  return { items: listResult.rows, total, page, pageSize };
}

async function listByProvider(providerId, { page = 1, pageSize = 20, level, valid } = {}) {
  const conditions = ['provider_id = $1'];
  const params = [providerId];

  if (level) {
    params.push(level);
    conditions.push(`level = $${params.length}`);
  }

  if (valid !== undefined) {
    params.push(Boolean(valid));
    conditions.push(`valid = $${params.length}`);
  }

  const { limit, offset } = buildPagination({ page, pageSize });

  const countSql = `
    SELECT COUNT(*)::int AS total
    FROM ${TABLE}
    WHERE ${conditions.join(' AND ')};
  `;
  const countResult = await query(countSql, params);
  const total = countResult.rows[0]?.total || 0;

  params.push(limit);
  params.push(offset);

  const listSql = `
    SELECT * FROM ${TABLE}
    WHERE ${conditions.join(' AND ')}
    ORDER BY created_at DESC
    LIMIT $${params.length - 1} OFFSET $${params.length};
  `;
  const listResult = await query(listSql, params);

  return { items: listResult.rows, total, page, pageSize };
}

async function aggregateProviderVerification({ providerId, from, to } = {}) {
  const conditions = ['provider_id = $1'];
  const params = [providerId];

  if (from) {
    params.push(from);
    conditions.push(`created_at >= $${params.length}`);
  }

  if (to) {
    params.push(to);
    conditions.push(`created_at <= $${params.length}`);
  }

  const sql = `
    SELECT
      COUNT(*)::int AS total_verifications,
      SUM(CASE WHEN valid THEN 1 ELSE 0 END)::int AS valid_count,
      SUM(CASE WHEN matches THEN 1 ELSE 0 END)::int AS match_count,
      MAX(created_at) AS last_verified_at
    FROM ${TABLE}
    WHERE ${conditions.join(' AND ')};
  `;

  const result = await query(sql, params);
  return result.rows[0] || {
    total_verifications: 0,
    valid_count: 0,
    match_count: 0,
    last_verified_at: null,
  };
}

async function countByLevel({ providerId, level } = {}) {
  const conditions = [];
  const params = [];

  if (providerId) {
    params.push(providerId);
    conditions.push(`provider_id = $${params.length}`);
  }

  if (level) {
    params.push(level);
    conditions.push(`level = $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const sql = `SELECT COUNT(*)::int AS total FROM ${TABLE} ${whereClause};`;
  const result = await query(sql, params);
  return result.rows[0]?.total || 0;
}

async function deleteOldVerifications({ olderThanDays = 180 } = {}) {
  const sql = `
    DELETE FROM ${TABLE}
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
  TABLE,
  createVerification,
  findById,
  findBySignature,
  listBySignature,
  listByProof,
  listByProvider,
  aggregateProviderVerification,
  countByLevel,
  deleteOldVerifications,
  withTransaction,
};