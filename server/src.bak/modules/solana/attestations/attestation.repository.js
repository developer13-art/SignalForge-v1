/**
 * Attestation Repository
 *
 * Persistence layer for Solana attestations. Attestations store only
 * hashes, IDs, and public-safe fields; sensitive data is never
 * persisted here.
 *
 * @module server/modules/solana/attestations/attestation.repository
 */

import { db } from '../../../database';
import { nowIso } from '@signalforge/shared/utils/date.util';

export async function insertAttestation({
  subjectType,
  subjectId,
  attestationType,
  attestationHash,
  publicData,
  onChainData,
  programId,
  pda,
  status,
}) {
  const { rows } = await db.query(
    `INSERT INTO solana_attestations
       (subject_type, subject_id, attestation_type, attestation_hash,
        public_data, on_chain_data, program_id, pda, status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10)
     RETURNING *`,
    [
      subjectType,
      subjectId,
      attestationType,
      attestationHash,
      publicData ? JSON.stringify(publicData) : null,
      onChainData ? JSON.stringify(onChainData) : null,
      programId || null,
      pda || null,
      status || 'PENDING',
      nowIso(),
    ],
  );
  return rows[0];
}

export async function findById({ attestationId }) {
  const { rows } = await db.query(
    `SELECT * FROM solana_attestations WHERE id = $1 LIMIT 1`,
    [attestationId],
  );
  return rows[0] || null;
}

export async function findByHash({ attestationHash }) {
  const { rows } = await db.query(
    `SELECT * FROM solana_attestations WHERE attestation_hash = $1 LIMIT 1`,
    [attestationHash],
  );
  return rows[0] || null;
}

export async function findBySubject({ subjectType, subjectId, attestationType }) {
  const conditions = ['subject_type = $1', 'subject_id = $2'];
  const params = [subjectType, subjectId];

  if (attestationType) {
    params.push(attestationType);
    conditions.push(`attestation_type = $${params.length}`);
  }

  const { rows } = await db.query(
    `SELECT * FROM solana_attestations
      WHERE ${conditions.join(' AND ')}
      ORDER BY created_at DESC`,
    params,
  );
  return rows;
}

export async function updateStatus({
  attestationId,
  status,
  txSignature,
  slot,
  blockTime,
  failureReason,
}) {
  const { rowCount } = await db.query(
    `UPDATE solana_attestations
        SET status = $1,
            tx_signature = COALESCE($2, tx_signature),
            slot = COALESCE($3, slot),
            block_time = COALESCE($4, block_time),
            failure_reason = COALESCE($5, failure_reason),
            confirmed_at = CASE WHEN $1 = 'CONFIRMED' THEN $6 ELSE confirmed_at END,
            updated_at = $6
      WHERE id = $7`,
    [status, txSignature || null, slot || null, blockTime || null, failureReason || null, nowIso(), attestationId],
  );
  return rowCount > 0;
}

export async function revoke({ attestationId, reason }) {
  const { rowCount } = await db.query(
    `UPDATE solana_attestations
        SET status = 'REVOKED',
            revoked_at = $1,
            revocation_reason = $2,
            updated_at = $1
      WHERE id = $3 AND status = 'CONFIRMED'`,
    [nowIso(), reason || null, attestationId],
  );
  return rowCount > 0;
}

export async function listBySubjectPaged({ subjectType, subjectId, pagination = {} }) {
  const limit = pagination.limit || 20;
  const offset = pagination.offset || 0;

  const { rows } = await db.query(
    `SELECT * FROM solana_attestations
      WHERE subject_type = $1 AND subject_id = $2
      ORDER BY created_at DESC
      LIMIT $3 OFFSET $4`,
    [subjectType, subjectId, limit, offset],
  );

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total
       FROM solana_attestations
      WHERE subject_type = $1 AND subject_id = $2`,
    [subjectType, subjectId],
  );

  return { items: rows, total: countResult.rows[0]?.total || 0 };
}

export async function listPending({ limit = 50 }) {
  const { rows } = await db.query(
    `SELECT * FROM solana_attestations
      WHERE status IN ('PENDING', 'SUBMITTED', 'FAILED')
      ORDER BY created_at ASC
      LIMIT $1`,
    [limit],
  );
  return rows;
}

export async function countByStatus() {
  const { rows } = await db.query(
    `SELECT status, COUNT(*)::int AS count FROM solana_attestations GROUP BY status`,
  );
  return rows;
}

export const attestationRepository = {
  insertAttestation,
  findById,
  findByHash,
  findBySubject,
  updateStatus,
  revoke,
  listBySubjectPaged,
  listPending,
  countByStatus,
};