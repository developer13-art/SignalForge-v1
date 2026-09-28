/**
 * Category Repository
 *
 * Persistence layer for support ticket categories.
 *
 * @module server/modules/support/categories/category.repository
 */
const { db } = require('../../../database');
const { nowIso } = require('@signalforge/shared/utils/date.util');
async function insertCategory({ name, slug, description, active }) {
  const { rows } = await db.query(
    `INSERT INTO support_categories
       (name, slug, description, active, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $5)
     RETURNING *`,
    [name, slug, description || null, active !== false, nowIso()],
  );
  return rows[0];
}
async function findById({ categoryId }) {
  const { rows } = await db.query(
    `SELECT * FROM support_categories WHERE id = $1 LIMIT 1`,
    [categoryId],
  );
  return rows[0] || null;
}
async function findBySlug({ slug }) {
  const { rows } = await db.query(
    `SELECT * FROM support_categories WHERE slug = $1 LIMIT 1`,
    [slug],
  );
  return rows[0] || null;
}
async function listAll({ activeOnly = false }) {
  const where = activeOnly ? 'WHERE active = TRUE' : '';
  const { rows } = await db.query(
    `SELECT * FROM support_categories ${where} ORDER BY name ASC`,
  );
  return rows;
}
async function updateCategory({ categoryId, name, description, active }) {
  const { rows } = await db.query(
    `UPDATE support_categories
        SET name = COALESCE($1, name),
            description = COALESCE($2, description),
            active = COALESCE($3, active),
            updated_at = $4
      WHERE id = $5
      RETURNING *`,
    [name || null, description || null, active === undefined ? null : active, nowIso(), categoryId],
  );
  return rows[0] || null;
}
async function deleteCategory({ categoryId }) {
  const { rowCount } = await db.query(
    `DELETE FROM support_categories WHERE id = $1`,
    [categoryId],
  );
  return rowCount > 0;
}
const categoryRepository = {
  insertCategory,
  findById,
  findBySlug,
  listAll,
  updateCategory,
  deleteCategory,
};
module.exports.categoryRepository = categoryRepository;

module.exports.insertCategory = insertCategory;

module.exports.findById = findById;

module.exports.findBySlug = findBySlug;

module.exports.listAll = listAll;

module.exports.updateCategory = updateCategory;

module.exports.deleteCategory = deleteCategory;
