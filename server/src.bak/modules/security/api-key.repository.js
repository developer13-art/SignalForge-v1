/**
 * API Key Repository
 *
 * @module server/modules/security/api-key.repository
 */

import { db } from '../../database';
import { nowIso } from '@signalforge/shared/utils/date.util';

export async function insertApiKey({
  userId,
  name,
  prefix,
  hashedKey,
  permissions,
  expiresAt,
}) {
  const { rows } = await db.query(
    `INSERT INTO api_keys
       (user_id, name, key_prefix, hashed_key, permissions, active, expires_at, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, TRUE, $6, $7, $7)
     RETURNING *`,
    [
      userId,
      name,
      prefix,
      hashedKey,
      permissions ? JSON.stringify(permissions) : null,
      expiresAt || null,
      nowIso(),
    ],
  );
  return rows[0];
}

export async function findByPrefix({ prefix }) {
  const { rows } = await db.query(
    `SELECT * FROM api_keys WHERE key_prefix = $1 AND active = TRUE LIMIT 1`,
    [prefix],
  );
  return rows[0] || null;
}

export async function findById({ apiKeyId }) {
  const { rows } = await db.query(
    `SELECT * FROM api_keys WHERE id = $1 LIMIT 1`,
    [apiKeyId],
  );
  return rows[0] || null;
}

export async function listByUser({ userId }) {
  const { rows } = await db.query(
    `SELECT id, name, key_prefix, permissions, active, expires_at, last_used_at, created_at
       FROM api_keys
      WHERE user_id = $1
      ORDER BY created_at DESC`,
    [userId],
  );
  return rows;
}

export async function touchLastUsed({ apiKeyId }) {
  await db.query(
    `UPDATE api_keys
        SET last_used_at = $1, updated_at = $1
      WHERE id = $2`,
    [nowIso(), apiKeyId],
  );
}

export async function revokeApiKey({ apiKeyId }) {
  const { rowCount } = await db.query(
    `UPDATE api_keys
        SET active = FALSE, revoked_at = $1, updated_at = $1
      WHERE id = $2`,
    [nowIso(), apiKeyId],
  );
  return rowCount > 0;
}

export async function deleteApiKey({ apiKeyId, userId }) {
  const { rowCount } = await db.query(
    `DELETE FROM api_keys WHERE id = $1 AND user_id = $2`,
    [apiKeyId, userId],
  );
  return rowCount > 0;
}

export const apiKeyRepository = {
  insertApiKey,
  findByPrefix,
  findById,
  listByUser,
  touchLastUsed,
  revokeApiKey,
  deleteApiKey,
};