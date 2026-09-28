'use strict';

const { query, transaction } = require('../../../../database/connection');
const { buildPagination } = require('../../../../database/helpers/pagination.helper');

/**
 * SignalForge - Memo Repository
 *
 * Dedicated persistence for memo submission records. The generic proof
 * table stores the logical record; this table stores per-submission
 * details so retries and reconciliation remain traceable.
 */

const TABLE = 'solana_proof_memo_submissions';

async function createSubmission(client, payload) {
  const sql = `
    INSERT INTO ${TABLE} (
      id,
      proof_id,
      provider_id,
      trade_id,
      kind,
      memo_payload,
      memo_string,
      memo_hash,
      memo_bytes,
      status,
      attempt,
      max_attempts,
      signature,
      reference,
      error_message,
      submitted_at,
      confirmed_at,
      created_at,
      updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15, $16, $17, NOW(), NOW()
    )
    RETURNING *;
  `;

  const params = [
    payload.id,
    payload.proofId || null,
    payload.providerId,
    payload.tradeId || null,
    payload.kind,
    JSON.stringify(payload.memoPayload || {}),
    payload.memoString || null,
    payload.memoHash || null,
    payload.memoBytes || 0,
    payload.status || 'pending',
    payload.attempt || 1,
    payload.maxAttempts || 5,
    payload.signature || null,
    payload.reference || null,
    payload.errorMessage || null,
    payload.submittedAt || null,
    payload.confirmedAt || null,
  ];

  const executor = client || { query: (text, values) => query(text, values) };
  const result = await executor.query(sql, params);
  return result.rows[0];
}

async function findSubmissionById(id) {
  const sql = `SELECT * FROM ${TABLE} WHERE id = $1 LIMIT 1;`;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
}

async function findSubmissionBySignature(signature) {
  const sql = `SELECT * FROM ${TABLE} WHERE signature = $1 LIMIT 1;`;
  const result = await query(sql, [signature]);
  return result.rows[0] || null;
}

async function findSubmissionsByProof(proofId) {
  const sql = `SELECT * FROM ${TABLE} WHERE proof_id = $1 ORDER BY attempt ASC;`;
  const result = await query(sql, [proofId]);
  return result.rows;
}

async function updateSubmission(id, updates) {
  const columnMap = {
    status: 'status',
    attempt: 'attempt',
    signature: 'signature',
    reference: 'reference',
    errorMessage: 'error_message',
    submittedAt: 'submitted_at',
    confirmedAt: 'confirmed_at',
    memoString: 'memo_string',
    memoHash: 'memo_hash',
  };

  const setClauses = ['updated_at = NOW()'];
  const params = [id];

  for (const [key, value] of Object.entries(updates || {})) {
    const column = columnMap[key];
    if (column && value !== undefined) {
      params.push(value);
      setClauses.push(`${column} = $${params.length}`);
    }
  }

  const sql = `
    UPDATE ${TABLE}
    SET ${setClauses.join(', ')}
    WHERE id = $1
    RETURNING *;
  `;

  const result = await query(sql, params);
  return result.rows[0] || null;
}

async function listPendingSubmissions({ maxAttempts, olderThanMs, limit = 50 } = {}) {
  const conditions = ["status IN ('pending', 'retrying')"];
  const params = [];

  if (maxAttempts) {
    params.push(maxAttempts);
    conditions.push(`attempt < $${params.length}`);
  }

  if (olderThanMs) {
    const threshold = new Date(Date.now() - olderThanMs).toISOString();
    params.push(threshold);
    conditions.push(`updated_at <= $${params.length}`);
  }

  params.push(limit);

  const sql = `
    SELECT * FROM ${TABLE}
    WHERE ${conditions.join(' AND ')}
    ORDER BY updated_at ASC
    LIMIT $${params.length};
  `;

  const result = await query(sql, params);
  return result.rows;
}

async function listSubmissionsByProvider(providerId, { page = 1, pageSize = 20, status } = {}) {
  const conditions = ['provider_id = $1'];
  const params = [providerId];

  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }

  const { limit, offset } = buildPagination({ page, pageSize });

  const countSql = `SELECT COUNT(*)::int AS total FROM ${TABLE} WHERE ${conditions.join(' AND ')};`;
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

  return {
    items: listResult.rows,
    total,
    page,
    pageSize,
  };
}

async function countByStatus({ providerId, status } = {}) {
  const conditions = [];
  const params = [];

  if (providerId) {
    params.push(providerId);
    conditions.push(`provider_id = $${params.length}`);
  }

  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const sql = `SELECT COUNT(*)::int AS total FROM ${TABLE} ${whereClause};`;
  const result = await query(sql, params);
  return result.rows[0]?.total || 0;
}

async function deleteOldSubmissions({ olderThanDays = 90 } = {}) {
  const sql = `
    DELETE FROM ${TABLE}
    WHERE created_at < NOW() - ($1 || ' days')::interval
      AND status IN ('confirmed', 'failed', 'expired')
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
  createSubmission,
  findSubmissionById,
  findSubmissionBySignature,
  findSubmissionsByProof,
  updateSubmission,
  listPendingSubmissions,
  listSubmissionsByProvider,
  countByStatus,
  deleteOldSubmissions,
  withTransaction,
};