'use strict';

const { query, transaction } = require('../../../../database/connection');

/**
 * SignalForge - Fetcher Repository
 *
 * Persists the raw artifacts fetched from the Solana network: parsed
 * transactions, memo entries, and signature metadata. This table is
 * used to avoid repeated RPC fetches for the same signature and to
 * retain an immutable audit trail of what was observed.
 */

const TABLE = 'solana_proof_fetches';

async function createFetch(client, payload) {
  const sql = `
    INSERT INTO ${TABLE} (
      id,
      signature,
      slot,
      block_time,
      confirmation_status,
      memo_text,
      authority,
      reference,
      err,
      raw_transaction,
      fetched_at,
      created_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()
    )
    RETURNING *;
  `;

  const params = [
    payload.id,
    payload.signature,
    payload.slot || null,
    payload.blockTime || null,
    payload.confirmationStatus || null,
    payload.memoText || null,
    payload.authority || null,
    payload.reference || null,
    payload.err ? JSON.stringify(payload.err) : null,
    payload.rawTransaction ? JSON.stringify(payload.rawTransaction) : null,
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
    ORDER BY fetched_at DESC
    LIMIT 1;
  `;
  const result = await query(sql, [signature]);
  return result.rows[0] || null;
}

async function listBySignature(signature) {
  const sql = `
    SELECT * FROM ${TABLE}
    WHERE signature = $1
    ORDER BY fetched_at DESC;
  `;
  const result = await query(sql, [signature]);
  return result.rows;
}

async function listByAuthority(authority, { limit = 50 } = {}) {
  const sql = `
    SELECT * FROM ${TABLE}
    WHERE authority = $1
    ORDER BY fetched_at DESC
    LIMIT $2;
  `;
  const result = await query(sql, [authority, limit]);
  return result.rows;
}

async function listByReference(reference) {
  const sql = `
    SELECT * FROM ${TABLE}
    WHERE reference = $1
    ORDER BY fetched_at DESC;
  `;
  const result = await query(sql, [reference]);
  return result.rows;
}

async function markStale(id, staleSince) {
  const sql = `
    UPDATE ${TABLE}
    SET fetched_at = $2
    WHERE id = $1
    RETURNING *;
  `;
  const result = await query(sql, [id, staleSince]);
  return result.rows[0] || null;
}

async function deleteOldFetches({ olderThanDays = 30 } = {}) {
  const sql = `
    DELETE FROM ${TABLE}
    WHERE created_at < NOW() - ($1 || ' days')::interval
    RETURNING id;
  `;
  const result = await query(sql, [String(olderThanDays)]);
  return result.rowCount;
}

async function findFreshBySignature(signature, { ttlSeconds = 300 } = {}) {
  const sql = `
    SELECT * FROM ${TABLE}
    WHERE signature = $1
      AND fetched_at >= NOW() - ($2 || ' seconds')::interval
    ORDER BY fetched_at DESC
    LIMIT 1;
  `;
  const result = await query(sql, [signature, String(ttlSeconds)]);
  return result.rows[0] || null;
}

async function withTransaction(handler) {
  return transaction(async (client) => handler(client));
}

module.exports = {
  TABLE,
  createFetch,
  findById,
  findBySignature,
  listBySignature,
  listByAuthority,
  listByReference,
  markStale,
  deleteOldFetches,
  findFreshBySignature,
  withTransaction,
};