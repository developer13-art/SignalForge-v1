/**
 * Provenance Repository
 *
 * Persistence layer for AI signal provenance records. Provenance
 * stores only hashes and identifiers; sensitive message content is
 * never persisted here.
 *
 * @module server/modules/solana/provenance/provenance.repository
 */

import { db } from '../../../database';
import { nowIso } from '@signalforge/shared/utils/date.util';

export async function insertProvenance({
  signalId,
  providerId,
  processingHash,
  signalHash,
  aiVersion,
  modelId,
  parserType,
  processingSteps,
  publicData,
  programId,
  status,
}) {
  const { rows } = await db.query(
    `INSERT INTO solana_provenance
       (signal_id, provider_id, processing_hash, signal_hash, ai_version,
        model_id, parser_type, processing_steps, public_data, program_id,
        status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $12)
     RETURNING *`,
    [
      signalId,
      providerId || null,
      processingHash,
      signalHash || null,
      aiVersion,
      modelId || null,
      parserType || null,
      processingSteps ? JSON.stringify(processingSteps) : null,
      publicData ? JSON.stringify(publicData) : null,
      programId || null,
      status || 'PENDING',
      nowIso(),
    ],
  );
  return rows[0];
}

export async function findById({ provenanceId }) {
  const { rows } = await db.query(
    `SELECT * FROM solana_provenance WHERE id = $1 LIMIT 1`,
    [provenanceId],
  );
  return rows[0] || null;
}

export async function findBySignalId({ signalId }) {
  const { rows } = await db.query(
    `SELECT * FROM solana_provenance
      WHERE signal_id = $1
      ORDER BY created_at DESC
      LIMIT 1`,
    [signalId],
  );
  return rows[0] || null;
}

export async function findByProcessingHash({ processingHash }) {
  const { rows } = await db.query(
    `SELECT * FROM solana_provenance WHERE processing_hash = $1 LIMIT 1`,
    [processingHash],
  );
  return rows[0] || null;
}

export async function updateStatus({
  provenanceId,
  status,
  txSignature,
  slot,
  blockTime,
  failureReason,
}) {
  const { rowCount } = await db.query(
    `UPDATE solana_provenance
        SET status = $1,
            tx_signature = COALESCE($2, tx_signature),
            slot = COALESCE($3, slot),
            block_time = COALESCE($4, block_time),
            failure_reason = COALESCE($5, failure_reason),
            anchored_at = CASE WHEN $1 = 'CONFIRMED' THEN $6 ELSE anchored_at END,
            updated_at = $6
      WHERE id = $7`,
    [status, txSignature || null, slot || null, blockTime || null, failureReason || null, nowIso(), provenanceId],
  );
  return rowCount > 0;
}

export async function listByProviderPaged({ providerId, pagination = {} }) {
  const limit = pagination.limit || 20;
  const offset = pagination.offset || 0;

  const { rows } = await db.query(
    `SELECT * FROM solana_provenance
      WHERE provider_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3`,
    [providerId, limit, offset],
  );

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total FROM solana_provenance WHERE provider_id = $1`,
    [providerId],
  );

  return { items: rows, total: countResult.rows[0]?.total || 0 };
}

export async function listPending({ limit = 50 }) {
  const { rows } = await db.query(
    `SELECT * FROM solana_provenance
      WHERE status IN ('PENDING', 'SUBMITTED', 'FAILED')
      ORDER BY created_at ASC
      LIMIT $1`,
    [limit],
  );
  return rows;
}

export async function countByStatus() {
  const { rows } = await db.query(
    `SELECT status, COUNT(*)::int AS count FROM solana_provenance GROUP BY status`,
  );
  return rows;
}

export const provenanceRepository = {
  insertProvenance,
  findById,
  findBySignalId,
  findByProcessingHash,
  updateStatus,
  listByProviderPaged,
  listPending,
  countByStatus,
};