/**
 * Include Helper
 *
 * Helpers for eagerly loading related records without the full
 * complexity of an ORM. Provides simple IN-based batch loading.
 *
 * @module server/database/helpers/include.helper
 */

import { getPool } from '../connection';

export async function loadRelatedByIds({ table, foreignKey, ids, extraConditions = null }) {
  if (!Array.isArray(ids) || ids.length === 0) {
    return {};
  }

  const pool = getPool();

  const where = extraConditions
    ? `WHERE ${foreignKey} = ANY($1) AND ${extraConditions}`
    : `WHERE ${foreignKey} = ANY($1)`;

  const { rows } = await pool.query(`SELECT * FROM ${table} ${where}`, [ids]);

  const grouped = {};

  for (const row of rows) {
    const key = row[foreignKey];
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(row);
  }

  return grouped;
}

export async function loadRelatedOneToOne({ table, foreignKey, ids }) {
  const grouped = await loadRelatedByIds({ table, foreignKey, ids });

  const single = {};
  for (const [key, list] of Object.entries(grouped)) {
    single[key] = list[0] || null;
  }

  return single;
}

export async function attachRelated({ items, table, foreignKey, localKey, as }) {
  if (!Array.isArray(items) || items.length === 0) {
    return items;
  }

  const ids = Array.from(new Set(items.map((item) => item[localKey]).filter(Boolean)));

  const grouped = await loadRelatedByIds({ table, foreignKey, ids });

  return items.map((item) => ({
    ...item,
    [as]: grouped[item[localKey]] || [],
  }));
}

export const includeHelper = {
  loadRelatedByIds,
  loadRelatedOneToOne,
  attachRelated,
};