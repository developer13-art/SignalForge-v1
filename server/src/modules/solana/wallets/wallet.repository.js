/**
 * Wallet Repository
 *
 * Persistence layer for Solana wallets linked to SignalForge accounts.
 *
 * @module server/modules/solana/wallets/wallet.repository
 */

import { db } from '../../../database';
import { nowIso } from '@signalforge/shared/utils/date.util';

export async function insertWallet({
  userId,
  walletAddress,
  isPrimary = false,
  label,
  verifiedAt,
  signatureProof,
  publicKey,
}) {
  if (isPrimary) {
    await db.query(
      `UPDATE solana_wallets
          SET is_primary = FALSE, updated_at = $1
        WHERE user_id = $2 AND is_primary = TRUE`,
      [nowIso(), userId],
    );
  }

  const { rows } = await db.query(
    `INSERT INTO solana_wallets
       (user_id, wallet_address, is_primary, label, verified_at,
        signature_proof, public_key, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
     ON CONFLICT (user_id, wallet_address) DO UPDATE
       SET is_primary = EXCLUDED.is_primary,
           label = EXCLUDED.label,
           verified_at = EXCLUDED.verified_at,
           signature_proof = EXCLUDED.signature_proof,
           public_key = EXCLUDED.public_key,
           updated_at = EXCLUDED.updated_at
     RETURNING *`,
    [
      userId,
      walletAddress,
      Boolean(isPrimary),
      label || null,
      verifiedAt || nowIso(),
      signatureProof || null,
      publicKey || null,
      nowIso(),
    ],
  );
  return rows[0];
}

export async function findById({ walletId }) {
  const { rows } = await db.query(
    `SELECT * FROM solana_wallets WHERE id = $1 LIMIT 1`,
    [walletId],
  );
  return rows[0] || null;
}

export async function findByAddress({ walletAddress }) {
  const { rows } = await db.query(
    `SELECT * FROM solana_wallets WHERE wallet_address = $1 LIMIT 1`,
    [walletAddress],
  );
  return rows[0] || null;
}

export async function findByUserId({ userId }) {
  const { rows } = await db.query(
    `SELECT * FROM solana_wallets
      WHERE user_id = $1
      ORDER BY is_primary DESC, created_at ASC`,
    [userId],
  );
  return rows;
}

export async function findPrimary({ userId }) {
  const { rows } = await db.query(
    `SELECT * FROM solana_wallets
      WHERE user_id = $1 AND is_primary = TRUE
      LIMIT 1`,
    [userId],
  );
  return rows[0] || null;
}

export async function setPrimary({ walletId, userId }) {
  await db.query(
    `UPDATE solana_wallets
        SET is_primary = FALSE, updated_at = $1
      WHERE user_id = $2 AND is_primary = TRUE`,
    [nowIso(), userId],
  );

  const { rowCount } = await db.query(
    `UPDATE solana_wallets
        SET is_primary = TRUE, updated_at = $1
      WHERE id = $2 AND user_id = $3`,
    [nowIso(), walletId, userId],
  );
  return rowCount > 0;
}

export async function updateLabel({ walletId, userId, label }) {
  const { rowCount } = await db.query(
    `UPDATE solana_wallets
        SET label = $1, updated_at = $2
      WHERE id = $3 AND user_id = $4`,
    [label || null, nowIso(), walletId, userId],
  );
  return rowCount > 0;
}

export async function deleteWallet({ walletId, userId }) {
  const { rowCount } = await db.query(
    `DELETE FROM solana_wallets
      WHERE id = $1 AND user_id = $2`,
    [walletId, userId],
  );
  return rowCount > 0;
}

export async function countByUser({ userId }) {
  const { rows } = await db.query(
    `SELECT COUNT(*)::int AS count FROM solana_wallets WHERE user_id = $1`,
    [userId],
  );
  return rows[0]?.count || 0;
}

export const walletRepository = {
  insertWallet,
  findById,
  findByAddress,
  findByUserId,
  findPrimary,
  setPrimary,
  updateLabel,
  deleteWallet,
  countByUser,
};