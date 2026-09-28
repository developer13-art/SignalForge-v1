/**
 * System Settings Repository
 *
 * Persistence layer for platform-wide settings stored in the
 * system_settings table. Each setting has a key, a typed value, and
 * optional metadata.
 *
 * @module server/modules/admin/system/system-settings.repository
 */

import { db } from '../../../database';
import { nowIso } from '@signalforge/shared/utils/date.util';

export async function findByKey({ key }) {
  const { rows } = await db.query(
    `SELECT * FROM system_settings WHERE key = $1 LIMIT 1`,
    [key],
  );
  return rows[0] || null;
}

export async function listAll({ category } = {}) {
  const params = [];
  let where = '';

  if (category) {
    params.push(category);
    where = `WHERE category = $1`;
  }

  const { rows } = await db.query(
    `SELECT * FROM system_settings ${where} ORDER BY key ASC`,
    params,
  );
  return rows;
}

export async function upsertSetting({
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
           category = COALESCE(EXCLUDED.category, system_settings.category),
           description = COALESCE(EXCLUDED.description, system_settings.description),
           is_public = EXCLUDED.is_public,
           updated_by = EXCLUDED.updated_by,
           updated_at = EXCLUDED.updated_at
     RETURNING *`,
    [
      key,
      value,
      valueType || 'string',
      category || null,
      description || null,
      Boolean(isPublic),
      updatedBy || null,
      nowIso(),
    ],
  );
  return rows[0];
}

export async function deleteSetting({ key }) {
  const { rowCount } = await db.query(
    `DELETE FROM system_settings WHERE key = $1`,
    [key],
  );
  return rowCount > 0;
}

export async function listPublicSettings() {
  const { rows } = await db.query(
    `SELECT key, value, value_type FROM system_settings WHERE is_public = TRUE ORDER BY key ASC`,
  );
  return rows;
}

export async function listByCategory({ category }) {
  const { rows } = await db.query(
    `SELECT * FROM system_settings WHERE category = $1 ORDER BY key ASC`,
    [category],
  );
  return rows;
}

export const systemSettingsRepository = {
  findByKey,
  listAll,
  upsertSetting,
  deleteSetting,
  listPublicSettings,
  listByCategory,
};