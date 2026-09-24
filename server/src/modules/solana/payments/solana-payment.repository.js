/**
 * Solana Payment Repository
 *
 * Persistence layer for Solana payments. Tracks payment intents,
 * their on-chain signature, and status transitions across the
 * confirmation lifecycle.
 *
 * @module server/modules/solana/payments/solana-payment.repository
 */

import { db } from '../../../database';
import { nowIso } from '@signalforge/shared/utils/date.util';

export async function insertPayment({
  userId,
  subscriptionId,
  purpose,
  amount,
  token,
  tokenMint,
  senderWallet,
  recipientWallet,
  reference,
  memo,
  amountUsd,
  exchangeRate,
  expiresAt,
  status,
}) {
  const { rows } = await db.query(
    `INSERT INTO solana_payments
       (user_id, subscription_id, purpose, amount, token, token_mint,
        sender_wallet, recipient_wallet, reference, memo, amount_usd,
        exchange_rate, expires_at, status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $15)
     RETURNING *`,
    [
      userId,
      subscriptionId || null,
      purpose || 'SUBSCRIPTION',
      amount,
      token,
      tokenMint || null,
      senderWallet || null,
      recipientWallet,
      reference || null,
      memo || null,
      amountUsd || null,
      exchangeRate || null,
      expiresAt || null,
      status || 'AWAITING_SIGNATURE',
      nowIso(),
    ],
  );
  return rows[0];
}

export async function findById({ paymentId }) {
  const { rows } = await db.query(
    `SELECT * FROM solana_payments WHERE id = $1 LIMIT 1`,
    [paymentId],
  );
  return rows[0] || null;
}

export async function findBySignature({ txSignature }) {
  const { rows } = await db.query(
    `SELECT * FROM solana_payments WHERE tx_signature = $1 LIMIT 1`,
    [txSignature],
  );
  return rows[0] || null;
}

export async function findByReference({ reference }) {
  const { rows } = await db.query(
    `SELECT * FROM solana_payments WHERE reference = $1 LIMIT 1`,
    [reference],
  );
  return rows[0] || null;
}

export async function attachSignature({ paymentId, txSignature, senderWallet }) {
  const { rowCount } = await db.query(
    `UPDATE solana_payments
        SET tx_signature = $1,
            sender_wallet = COALESCE($2, sender_wallet),
            status = 'SUBMITTED',
            submitted_at = $3,
            updated_at = $3
      WHERE id = $4`,
    [txSignature, senderWallet || null, nowIso(), paymentId],
  );
  return rowCount > 0;
}

export async function updateStatus({
  paymentId,
  status,
  slot,
  blockTime,
  confirmations,
  failureReason,
}) {
  const { rowCount } = await db.query(
    `UPDATE solana_payments
        SET status = $1,
            slot = COALESCE($2, slot),
            block_time = COALESCE($3, block_time),
            confirmations = COALESCE($4, confirmations),
            failure_reason = COALESCE($5, failure_reason),
            confirmed_at = CASE WHEN $1 = 'CONFIRMED' THEN $6 ELSE confirmed_at END,
            finalized_at = CASE WHEN $1 = 'FINALIZED' THEN $6 ELSE finalized_at END,
            updated_at = $6
      WHERE id = $7`,
    [status, slot || null, blockTime || null, confirmations || null, failureReason || null, nowIso(), paymentId],
  );
  return rowCount > 0;
}

export async function markRefunded({ paymentId, refundTxSignature, reason }) {
  const { rowCount } = await db.query(
    `UPDATE solana_payments
        SET status = 'REFUNDED',
            refund_tx_signature = $1,
            refund_reason = $2,
            refunded_at = $3,
            updated_at = $3
      WHERE id = $4`,
    [refundTxSignature || null, reason || null, nowIso(), paymentId],
  );
  return rowCount > 0;
}

export async function listByUser({ userId, filters = {}, pagination = {} }) {
  const conditions = ['user_id = $1'];
  const params = [userId];

  if (filters.status) {
    params.push(filters.status);
    conditions.push(`status = $${params.length}`);
  }

  if (filters.purpose) {
    params.push(filters.purpose);
    conditions.push(`purpose = $${params.length}`);
  }

  if (filters.token) {
    params.push(filters.token);
    conditions.push(`token = $${params.length}`);
  }

  const where = `WHERE ${conditions.join(' AND ')}`;
  const limit = pagination.limit || 20;
  const offset = pagination.offset || 0;

  const { rows } = await db.query(
    `SELECT * FROM solana_payments
       ${where}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total FROM solana_payments ${where}`,
    params,
  );

  return {
    items: rows,
    total: countResult.rows[0]?.total || 0,
  };
}

export async function findPendingForVerification({ limit = 100 }) {
  const { rows } = await db.query(
    `SELECT * FROM solana_payments
      WHERE status IN ('SUBMITTED', 'CONFIRMING')
      ORDER BY submitted_at ASC NULLS LAST
      LIMIT $1`,
    [limit],
  );
  return rows;
}

export async function findExpired({ limit = 200 }) {
  const { rows } = await db.query(
    `SELECT * FROM solana_payments
      WHERE status = 'AWAITING_SIGNATURE'
        AND expires_at IS NOT NULL
        AND expires_at < $1
      LIMIT $2`,
    [nowIso(), limit],
  );
  return rows;
}

export async function countByStatus() {
  const { rows } = await db.query(
    `SELECT status, COUNT(*)::int AS count, COALESCE(SUM(amount_usd), 0)::numeric AS total_usd
       FROM solana_payments
      GROUP BY status`,
  );
  return rows;
}

export async function listRecent({ limit = 50 }) {
  const { rows } = await db.query(
    `SELECT * FROM solana_payments
      ORDER BY created_at DESC
      LIMIT $1`,
    [limit],
  );
  return rows;
}

export const solanaPaymentRepository = {
  insertPayment,
  findById,
  findBySignature,
  findByReference,
  attachSignature,
  updateStatus,
  markRefunded,
  listByUser,
  findPendingForVerification,
  findExpired,
  countByStatus,
  listRecent,
};