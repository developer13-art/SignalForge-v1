/**
 * Indexer Checkpoint Service
 *
 * Persists the last processed slot per program so the indexer can
 * resume from where it left off after a restart. Checkpoints are
 * updated only after a slot has been fully processed.
 *
 * @module server/modules/solana/indexer/indexer-checkpoint.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { nowIso } from '@signalforge/shared/utils/date.util';
import { db } from '../../../database';

export async function getCheckpoint({ programId }) {
  if (!programId) {
    throw new AppError('programId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rows } = await db.query(
    `SELECT * FROM solana_indexer_checkpoints WHERE program_id = $1 LIMIT 1`,
    [programId],
  );

  const row = rows[0];

  if (!row) {
    return {
      programId,
      lastProcessedSlot: null,
      updatedAt: null,
    };
  }

  return {
    programId: row.program_id,
    lastProcessedSlot: Number(row.last_processed_slot),
    updatedAt: row.updated_at,
  };
}

export async function saveCheckpoint({ programId, lastProcessedSlot }) {
  if (!programId || lastProcessedSlot === undefined || lastProcessedSlot === null) {
    throw new AppError('programId and lastProcessedSlot are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const slotNumber = Number(lastProcessedSlot);

  if (!Number.isInteger(slotNumber) || slotNumber < 0) {
    throw new AppError('lastProcessedSlot must be a non-negative integer', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rows } = await db.query(
    `INSERT INTO solana_indexer_checkpoints
       (program_id, last_processed_slot, updated_at)
     VALUES ($1, $2, $3)
     ON CONFLICT (program_id) DO UPDATE
       SET last_processed_slot = GREATEST(
             solana_indexer_checkpoints.last_processed_slot,
             EXCLUDED.last_processed_slot
           ),
           updated_at = EXCLUDED.updated_at
     RETURNING *`,
    [programId, slotNumber, nowIso()],
  );

  logger.debug({ programId, lastProcessedSlot: slotNumber }, 'Indexer checkpoint saved');

  return {
    programId: rows[0].program_id,
    lastProcessedSlot: Number(rows[0].last_processed_slot),
    updatedAt: rows[0].updated_at,
  };
}

export async function getCheckpoints() {
  const { rows } = await db.query(
    `SELECT program_id, last_processed_slot, updated_at
       FROM solana_indexer_checkpoints
      ORDER BY updated_at DESC`,
  );

  return rows.map((row) => ({
    programId: row.program_id,
    lastProcessedSlot: Number(row.last_processed_slot),
    updatedAt: row.updated_at,
  }));
}

export async function resetCheckpoint({ programId }) {
  if (!programId) {
    throw new AppError('programId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rowCount } = await db.query(
    `DELETE FROM solana_indexer_checkpoints WHERE program_id = $1`,
    [programId],
  );

  return { reset: rowCount > 0 };
}

export const indexerCheckpointService = {
  getCheckpoint,
  saveCheckpoint,
  getCheckpoints,
  resetCheckpoint,
};