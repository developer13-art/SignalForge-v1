/**
 * Verification Provider Repository
 *
 * @module server/modules/compliance/verification-providers/verification-provider.repository
 */

import { db } from '../../../database';
import { nowIso } from '@signalforge/shared/utils/date.util';

export async function insertProvider({ code, label, type, config, active, priority }) {
  const { rows } = await db.query(
    `INSERT INTO verification_providers
       (code, label, type, config, active, priority, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
     RETURNING *`,
    [
      code,
      label,
      type,
      config ? JSON.stringify(config) : null,
      active !== false,
      priority || 100,
      nowIso(),
    ],
  );
  return rows[0];
}

export async function findById({ providerId }) {
  const { rows } = await db.query(
    `SELECT * FROM verification_providers WHERE id = $1 LIMIT 1`,
    [providerId],
  );
  return rows[0] || null;
}

export async function findByCode({ code }) {
  const { rows } = await db.query(
    `SELECT * FROM verification_providers WHERE code = $1 LIMIT 1`,
    [code],
  );
  return rows[0] || null;
}

export async function listAll({ activeOnly = false } = {}) {
  const where = activeOnly ? `WHERE active = TRUE` : '';
  const { rows } = await db.query(
    `SELECT * FROM verification_providers ${where}
      ORDER BY priority ASC, label ASC`,
  );
  return rows;
}

export async function updateProvider({ providerId, label, type, config, active, priority }) {
  const { rows } = await db.query(
    `UPDATE verification_providers
        SET label = COALESCE($1, label),
            type = COALESCE($2, type),
            config = COALESCE($3, config),
            active = COALESCE($4, active),
            priority = COALESCE($5, priority),
            updated_at = $6
      WHERE id = $7
      RETURNING *`,
    [
      label || null,
      type || null,
      config ? JSON.stringify(config) : null,
      active === undefined ? null : active,
      priority === undefined ? null : priority,
      nowIso(),
      providerId,
    ],
  );
  return rows[0] || null;
}

export async function deleteProvider({ providerId }) {
  const { rowCount } = await db.query(
    `DELETE FROM verification_providers WHERE id = $1`,
    [providerId],
  );
  return rowCount > 0;
}

export const verificationProviderRepository = {
  insertProvider,
  findById,
  findByCode,
  listAll,
  updateProvider,
  deleteProvider,
};