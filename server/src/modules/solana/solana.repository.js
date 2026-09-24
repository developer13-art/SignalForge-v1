/**
 * Solana Repository
 *
 * Cross-cutting persistence helpers for the Solana module. Handles
 * generic records (attestations, provenance anchors, payment
 * references, transactions) that are shared across sub-services.
 *
 * @module server/modules/solana/solana.repository
 */

import { db } from '../../database';
import { nowIso } from '@signalforge/shared/utils/date.util';

export async function findAttestationById({ attestationId }) {
  const { rows } = await db.query(
    `SELECT * FROM solana_attestations WHERE id = $1 LIMIT 1`,
    [attestationId],
  );
  return rows[0] || null;
}

export async function listAttestationsBySubject({ subjectType, subjectId }) {
  const { rows } = await db.query(
    `SELECT * FROM solana_attestations
      WHERE subject_type = $1 AND subject_id = $2
      ORDER BY created_at DESC`,
    [subjectType, subjectId],
  );
  return rows;
}

export async function findProvenanceById({ provenanceId }) {
  const { rows } = await db.query(
    `SELECT * FROM solana_provenance WHERE id = $1 LIMIT 1`,
    [provenanceId],
  );
  return rows[0] || null;
}

export async function findProvenanceBySignalId({ signalId }) {
  const { rows } = await db.query(
    `SELECT * FROM solana_provenance WHERE signal_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [signalId],
  );
  return rows[0] || null;
}

export async function findPaymentById({ paymentId }) {
  const { rows } = await db.query(
    `SELECT * FROM solana_payments WHERE id = $1 LIMIT 1`,
    [paymentId],
  );
  return rows[0] || null;
}

export async function findPaymentBySignature({ txSignature }) {
  const { rows } = await db.query(
    `SELECT * FROM solana_payments WHERE tx_signature = $1 LIMIT 1`,
    [txSignature],
  );
  return rows[0] || null;
}

export async function findTransactionBySignature({ txSignature }) {
  const { rows } = await db.query(
    `SELECT * FROM solana_transactions WHERE tx_signature = $1 LIMIT 1`,
    [txSignature],
  );
  return rows[0] || null;
}

export async function findWalletByAddress({ walletAddress }) {
  const { rows } = await db.query(
    `SELECT * FROM solana_wallets WHERE wallet_address = $1 LIMIT 1`,
    [walletAddress],
  );
  return rows[0] || null;
}

export async function findWalletByUserId({ userId }) {
  const { rows } = await db.query(
    `SELECT * FROM solana_wallets WHERE user_id = $1 ORDER BY is_primary DESC, created_at ASC`,
    [userId],
  );
  return rows;
}

export async function recordIndexerCheckpoint({ programId, lastSlot }) {
  const { rows } = await db.query(
    `INSERT INTO solana_indexer_checkpoints (program_id, last_processed_slot, updated_at)
     VALUES ($1, $2, $3)
     ON CONFLICT (program_id) DO UPDATE
       SET last_processed_slot = EXCLUDED.last_processed_slot,
           updated_at = EXCLUDED.updated_at
     RETURNING *`,
    [programId, lastSlot, nowIso()],
  );
  return rows[0];
}

export async function getIndexerCheckpoint({ programId }) {
  const { rows } = await db.query(
    `SELECT * FROM solana_indexer_checkpoints WHERE program_id = $1 LIMIT 1`,
    [programId],
  );
  return rows[0] || null;
}

export const solanaRepository = {
  findAttestationById,
  listAttestationsBySubject,
  findProvenanceById,
  findProvenanceBySignalId,
  findPaymentById,
  findPaymentBySignature,
  findTransactionBySignature,
  findWalletByAddress,
  findWalletByUserId,
  recordIndexerCheckpoint,
  getIndexerCheckpoint,
};