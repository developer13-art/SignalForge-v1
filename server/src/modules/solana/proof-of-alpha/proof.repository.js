'use strict';

const { query, transaction } = require('../../../database/connection');
const { buildPagination } = require('../../../database/helpers/pagination.helper');

/**
 * SignalForge - Proof of Alpha Repository
 *
 * Persistence layer for proof records, verification rows, and the
 * leaderboard cache. All read methods are safe to run without a
 * transaction; all write methods accept an optional client for
 * composition inside a transaction.
 */

const TABLES = Object.freeze({
  PROOFS: 'solana_proof_records',
  VERIFICATIONS: 'solana_proof_verifications',
  INDEX: 'solana_proof_index',
  LEADERBOARD: 'solana_leaderboard_cache',
});

async function createProof(client, payload) {
  const sql = `
    INSERT INTO ${TABLES.PROOFS} (
      id,
      provider_id,
      trade_id,
      kind,
      status,
      verification_level,
      memo_version,
      memo_payload,
      memo_bytes,
      signature,
      reference,
      block_slot,
      block_time,
      authority_public_key,
      raw_response,
      error_message,
      submitted_at,
      confirmed_at,
      created_at,
      updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15, $16, $17, $18, NOW(), NOW()
    )
    RETURNING *;
  `;

  const params = [
    payload.id,
    payload.providerId,
    payload.tradeId || null,
    payload.kind,
    payload.status || 'pending',
    payload.verificationLevel || 'unverified',
    payload.memoVersion || 1,
    JSON.stringify(payload.memoPayload || {}),
    payload.memoBytes || 0,
    payload.signature || null,
    payload.reference || null,
    payload.blockSlot || null,
    payload.blockTime || null,
    payload.authorityPublicKey || null,
    payload.rawResponse ? JSON.stringify(payload.rawResponse) : null,
    payload.errorMessage || null,
    payload.submittedAt || null,
    payload.confirmedAt || null,
  ];

  const executor = client || { query: (text, values) => query(text, values) };
  const result = await executor.query(sql, params);
  return result.rows[0];
}

async function findProofById(id) {
  const sql = `SELECT * FROM ${TABLES.PROOFS} WHERE id = $1 LIMIT 1;`;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
}

async function findProofBySignature(signature) {
  const sql = `SELECT * FROM ${TABLES.PROOFS} WHERE signature = $1 LIMIT 1;`;
  const result = await query(sql, [signature]);
  return result.rows[0] || null;
}

async function findProofByTradeId(tradeId) {
  const sql = `SELECT * FROM ${TABLES.PROOFS} WHERE trade_id = $1 ORDER BY created_at DESC LIMIT 1;`;
  const result = await query(sql, [tradeId]);
  return result.rows[0] || null;
}

async function findProofsByProvider(providerId, { page = 1, pageSize = 20, status, kind } = {}) {
  const conditions = ['provider_id = $1'];
  const params = [providerId];

  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }

  if (kind) {
    params.push(kind);
    conditions.push(`kind = $${params.length}`);
  }

  const { limit, offset } = buildPagination({ page, pageSize });

  const countSql = `SELECT COUNT(*)::int AS total FROM ${TABLES.PROOFS} WHERE ${conditions.join(' AND ')};`;
  const countResult = await query(countSql, params);
  const total = countResult.rows[0]?.total || 0;

  params.push(limit);
  params.push(offset);

  const listSql = `
    SELECT * FROM ${TABLES.PROOFS}
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

async function updateProofStatus(id, updates) {
  const setClauses = ['updated_at = NOW()'];
  const params = [id];

  const columnMap = {
    status: 'status',
    verificationLevel: 'verification_level',
    signature: 'signature',
    reference: 'reference',
    blockSlot: 'block_slot',
    blockTime: 'block_time',
    rawResponse: 'raw_response',
    errorMessage: 'error_message',
    submittedAt: 'submitted_at',
    confirmedAt: 'confirmed_at',
  };

  for (const [key, value] of Object.entries(updates || {})) {
    const column = columnMap[key];
    if (column && value !== undefined) {
      params.push(key === 'rawResponse' ? JSON.stringify(value) : value);
      setClauses.push(`${column} = $${params.length}`);
    }
  }

  const sql = `
    UPDATE ${TABLES.PROOFS}
    SET ${setClauses.join(', ')}
    WHERE id = $1
    RETURNING *;
  `;

  const result = await query(sql, params);
  return result.rows[0] || null;
}

async function createVerification(client, payload) {
  const sql = `
    INSERT INTO ${TABLES.VERIFICATIONS} (
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

async function findVerificationBySignature(signature) {
  const sql = `SELECT * FROM ${TABLES.VERIFICATIONS} WHERE signature = $1 ORDER BY created_at DESC LIMIT 1;`;
  const result = await query(sql, [signature]);
  return result.rows[0] || null;
}

async function listVerificationsByProof(proofId, { page = 1, pageSize = 20 } = {}) {
  const { limit, offset } = buildPagination({ page, pageSize });

  const countSql = `SELECT COUNT(*)::int AS total FROM ${TABLES.VERIFICATIONS} WHERE proof_id = $1;`;
  const countResult = await query(countSql, [proofId]);
  const total = countResult.rows[0]?.total || 0;

  const listSql = `
    SELECT * FROM ${TABLES.VERIFICATIONS}
    WHERE proof_id = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3;
  `;
  const listResult = await query(listSql, [proofId, limit, offset]);

  return {
    items: listResult.rows,
    total,
    page,
    pageSize,
  };
}

async function countProofsByProvider({ providerId, status, from, to } = {}) {
  const conditions = ['provider_id = $1'];
  const params = [providerId];

  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }

  if (from) {
    params.push(from);
    conditions.push(`created_at >= $${params.length}`);
  }

  if (to) {
    params.push(to);
    conditions.push(`created_at <= $${params.length}`);
  }

  const sql = `SELECT COUNT(*)::int AS total FROM ${TABLES.PROOFS} WHERE ${conditions.join(' AND ')};`;
  const result = await query(sql, params);
  return result.rows[0]?.total || 0;
}

async function aggregateProviderStats({ providerId, from, to } = {}) {
  const conditions = ['provider_id = $1', "status = 'confirmed'"];
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
      COUNT(*)::int AS total_proofs,
      SUM(CASE WHEN (memo_payload->>'r')::numeric > 0 THEN 1 ELSE 0 END)::int AS winning_trades,
      SUM(CASE WHEN (memo_payload->>'r')::numeric < 0 THEN 1 ELSE 0 END)::int AS losing_trades,
      SUM(CASE WHEN (memo_payload->>'r')::numeric = 0 THEN 1 ELSE 0 END)::int AS break_even_trades,
      COALESCE(SUM((memo_payload->>'u')::numeric), 0) AS total_pnl_usd,
      COALESCE(AVG((memo_payload->>'r')::numeric), 0) AS average_pnl_percent
    FROM ${TABLES.PROOFS}
    WHERE ${conditions.join(' AND ')}
      AND kind = 'trade_closed';
  `;

  const result = await query(sql, params);
  return result.rows[0] || {
    total_proofs: 0,
    winning_trades: 0,
    losing_trades: 0,
    break_even_trades: 0,
    total_pnl_usd: 0,
    average_pnl_percent: 0,
  };
}

async function getLeaderboardRows({ window, sortBy, limit, offset = 0 } = {}) {
  const sql = `
    SELECT *
    FROM ${TABLES.LEADERBOARD}
    WHERE window = $1 AND sort_by = $2
    ORDER BY rank ASC
    LIMIT $3 OFFSET $4;
  `;
  const result = await query(sql, [window, sortBy, limit, offset]);
  return result.rows;
}

async function replaceLeaderboardCache({ window, sortBy, rows } = {}) {
  return transaction(async (client) => {
    await client.query(
      `DELETE FROM ${TABLES.LEADERBOARD} WHERE window = $1 AND sort_by = $2;`,
      [window, sortBy],
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return [];
    }

    const inserted = [];

    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index];
      const insertSql = `
        INSERT INTO ${TABLES.LEADERBOARD} (
          id,
          window,
          sort_by,
          rank,
          provider_id,
          provider_name,
          total_trades,
          winning_trades,
          losing_trades,
          win_rate,
          total_pnl_usd,
          average_pnl_percent,
          profit_factor,
          verification_level,
          last_verified_at,
          metadata,
          created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, NOW()
        )
        RETURNING *;
      `;

      const params = [
        `${window}_${sortBy}_${index + 1}_${row.provider_id}`,
        window,
        sortBy,
        index + 1,
        row.provider_id,
        row.provider_name || null,
        row.total_trades || 0,
        row.winning_trades || 0,
        row.losing_trades || 0,
        row.win_rate || 0,
        row.total_pnl_usd || 0,
        row.average_pnl_percent || 0,
        row.profit_factor || 0,
        row.verification_level || 'unverified',
        row.last_verified_at || null,
        JSON.stringify(row.metadata || {}),
      ];

      const result = await client.query(insertSql, params);
      inserted.push(result.rows[0]);
    }

    return inserted;
  });
}

async function listPendingProofs({ olderThanMs, limit = 50 } = {}) {
  const conditions = ["status IN ('pending', 'submitted', 'submitting')"];
  const params = [];

  if (olderThanMs) {
    const threshold = new Date(Date.now() - olderThanMs).toISOString();
    params.push(threshold);
    conditions.push(`created_at <= $${params.length}`);
  }

  params.push(limit);

  const sql = `
    SELECT * FROM ${TABLES.PROOFS}
    WHERE ${conditions.join(' AND ')}
    ORDER BY created_at ASC
    LIMIT $${params.length};
  `;

  const result = await query(sql, params);
  return result.rows;
}

async function listPublicProofs({ providerId, page = 1, pageSize = 20 } = {}) {
  const conditions = ["status = 'confirmed'"];
  const params = [];

  if (providerId) {
    params.push(providerId);
    conditions.push(`provider_id = $${params.length}`);
  }

  const { limit, offset } = buildPagination({ page, pageSize });

  const countSql = `SELECT COUNT(*)::int AS total FROM ${TABLES.PROOFS} WHERE ${conditions.join(' AND ')};`;
  const countResult = await query(countSql, params);
  const total = countResult.rows[0]?.total || 0;

  params.push(limit);
  params.push(offset);

  const listSql = `
    SELECT * FROM ${TABLES.PROOFS}
    WHERE ${conditions.join(' AND ')}
    ORDER BY confirmed_at DESC NULLS LAST, created_at DESC
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

async function withTransaction(handler) {
  return transaction(async (client) => handler(client));
}

module.exports = {
  TABLES,
  createProof,
  findProofById,
  findProofBySignature,
  findProofByTradeId,
  findProofsByProvider,
  updateProofStatus,
  createVerification,
  findVerificationBySignature,
  listVerificationsByProof,
  countProofsByProvider,
  aggregateProviderStats,
  getLeaderboardRows,
  replaceLeaderboardCache,
  listPendingProofs,
  listPublicProofs,
  withTransaction,
};