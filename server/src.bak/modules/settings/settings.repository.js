/**
 * Settings Repository
 *
 * @module server/modules/settings/settings.repository
 */

import { db } from '../../database';
import { nowIso } from '@signalforge/shared/utils/date.util';

export async function findByKey({ key }) {
  const { rows } = await db.query(
    `SELECT * FROM system_settings WHERE key = $1 LIMIT 1`,
    [key],
  );
  return rows[0] || null;
}

export async function listByCategory({ category }) {
  const { rows } = await db.query(
    `SELECT * FROM system_settings WHERE category = $1 ORDER BY key ASC`,
    [category],
  );
  return rows;
}

export async function listAll() {
  const { rows } = await db.query(
    `SELECT * FROM system_settings ORDER BY key ASC`,
  );
  return rows;
}

export async function listPublic() {
  const { rows } = await db.query(
    `SELECT key, value, value_type FROM system_settings
      WHERE is_public = TRUE
      ORDER BY key ASC`,
  );
  return rows;
}

export async function upsert({
  key,
  value,
  valueType,
  category,
  description,
  isPublic,
  updatedBy,
}) {
  const { rows } = await db.query(
    `INSERT INTO system_settings
       (key, value, value_type, category, description, is_public, updated_by, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
     ON CONFLICT (key) DO UPDATE
       SET value = EXCLUDED.value,
           value_type = EXCLUDED.value_type,
           category = EXCLUDED.category,
           description = COALESCE(EXCLUDED.description, system_settings.description),
           is_public = EXCLUDED.is_public,
           updated_by = EXCLUDED.updated_by,
           updated_at = EXCLUDED.updated_at
     RETURNING *`,
    [
      key,
      value,
      valueType,
      category,
      description || null,
      Boolean(isPublic),
      updatedBy || null,
      nowIso(),
    ],
  );
  return rows[0];
}

export async function deleteByKey({ key }) {
  const { rowCount } = await db.query(
    `DELETE FROM system_settings WHERE key = $1`,
    [key],
  );
  return rowCount > 0;
}

export const settingsRepository = {
  findByKey,
  listByCategory,
  listAll,
  listPublic,
  upsert,
  deleteByKey,
};