/**
 * Transaction Repository
 *
 * Persistence layer for Solana transactions. This is the raw
 * on-chain transaction log used by the indexer, verification, and
 * audit tooling.
 *
 * @module server/modules/solana/transactions/transaction.repository
 */

import { db } from '../../../database';
import { nowIso } from '@signalforge/shared/utils/date.util';

export async function insertTransaction({
  txSignature,
  purpose,
  referenceType,
  referenceId,
  userId,
  status,
  rawTransaction,
  slot,
  blockTime,
}) {
  const { rows } = await db.query(
    `INSERT INTO solana_transactions
       (tx_signature, purpose, reference_type, reference_id, user_id, status,
        raw_transaction, slot, block_time, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10)
     ON CONFLICT (tx_signature) DO NOTHING
     RETURNING *`,
    [
      txSignature,
      purpose || null,
      referenceType || null,
      referenceId || null,
      userId || null,
      status || 'PENDING',
      rawTransaction ? JSON.stringify(rawTransaction) : null,
      slot || null,
      blockTime || null,
      nowIso(),
    ],
  );
  return rows[0] || null;
}

export async function findBySignature({ txSignature }) {
  const { rows } = await db.query(
    `SELECT * FROM solana_transactions WHERE tx_signature = $1 LIMIT 1`,
    [txSignature],
  );
  return rows[0] || null;
}

export async function updateStatus({
  txSignature,
  status,
  slot,
  blockTime,
  errorReason,
}) {
  const { rowCount } = await db.query(
    `UPDATE solana_transactions
        SET status = $1,
            slot = COALESCE($2, slot),
            block_time = COALESCE($3, block_time),
            error_reason = COALESCE($4, error_reason),
            confirmed_at = CASE WHEN $1 = 'CONFIRMED' THEN $5 ELSE confirmed_at END,
            updated_at = $5
      WHERE tx_signature = $6`,
    [status, slot || null, blockTime || null, errorReason || null, nowIso(), txSignature],
  );
  return rowCount > 0;
}

export async function listByUser({ userId, filters = {}, pagination = {} }) {
  const conditions = ['user_id = $1'];
  const params = [userId];

  if (filters.purpose) {
    params.push(filters.purpose);
    conditions.push(`purpose = $${params.length}`);
  }

  if (filters.status) {
    params.push(filters.status);
    conditions.push(`status = $${params.length}`);
  }

  if (filters.from) {
    params.push(filters.from);
    conditions.push(`created_at >= $${params.length}`);
  }

  if (filters.to) {
    params.push(filters.to);
    conditions.push(`created_at <= $${params.length}`);
  }

  const where = `WHERE ${conditions.join(' AND ')}`;
  const limit = pagination.limit || 20;
  const offset = pagination.offset || 0;

  const { rows } = await db.query(
    `SELECT * FROM solana_transactions
       ${where}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total FROM solana_transactions ${where}`,
    params,
  );

  return {
    items: rows,
    total: countResult.rows[0]?.total || 0,
  };
}

export async function listPendingForConfirmation({ limit = 100 }) {
  const { rows } = await db.query(
    `SELECT * FROM solana_transactions
      WHERE status = 'SUBMITTED'
      ORDER BY created_at ASC
      LIMIT $1`,
    [limit],
  );
  return rows;
}

export async function countByStatus() {
  const { rows } = await db.query(
    `SELECT status, COUNT(*)::int AS count FROM solana_transactions GROUP BY status`,
  );
  return rows;
}

export const transactionRepository = {
  insertTransaction,
  findBySignature,
  updateStatus,
  listByUser,
  listPendingForConfirmation,
  countByStatus,
};