/**
 * White Label Repository
 *
 * Low-level persistence for white-label projects.
 *
 * @module server/modules/white-label/white-label.repository
 */
const { db } = require('../../database');
const { nowIso } = require('@signalforge/shared/utils/date.util');
async function insertProject({
  ownerUserId,
  slug,
  name,
  brandName,
  brandDomain,
  status = 'DRAFT',
}) {
  const { rows } = await db.query(
    `INSERT INTO white_label_projects
       (owner_user_id, slug, name, brand_name, brand_domain, status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
     RETURNING *`,
    [ownerUserId, slug, name, brandName || null, brandDomain || null, status, nowIso()],
  );
  return rows[0];
}
async function findById({ projectId }) {
  const { rows } = await db.query(
    `SELECT * FROM white_label_projects WHERE id = $1 LIMIT 1`,
    [projectId],
  );
  return rows[0] || null;
}
async function findBySlug({ slug }) {
  const { rows } = await db.query(
    `SELECT * FROM white_label_projects WHERE slug = $1 LIMIT 1`,
    [slug],
  );
  return rows[0] || null;
}
async function listByOwner({ ownerUserId }) {
  const { rows } = await db.query(
    `SELECT * FROM white_label_projects
      WHERE owner_user_id = $1
      ORDER BY created_at DESC`,
    [ownerUserId],
  );
  return rows;
}
async function updateStatus({ projectId, status }) {
  const { rowCount } = await db.query(
    `UPDATE white_label_projects
        SET status = $1, updated_at = $2
      WHERE id = $3`,
    [status, nowIso(), projectId],
  );
  return rowCount > 0;
}
async function updateProject({ projectId, name, brandName, brandDomain }) {
  const { rowCount } = await db.query(
    `UPDATE white_label_projects
        SET name = COALESCE($1, name),
            brand_name = COALESCE($2, brand_name),
            brand_domain = COALESCE($3, brand_domain),
            updated_at = $4
      WHERE id = $5`,
    [name || null, brandName || null, brandDomain || null, nowIso(), projectId],
  );
  return rowCount > 0;
}
async function deleteProject({ projectId }) {
  const { rowCount } = await db.query(
    `DELETE FROM white_label_projects WHERE id = $1`,
    [projectId],
  );
  return rowCount > 0;
}
async function listAll() {
  const { rows } = await db.query(
    `SELECT * FROM white_label_projects ORDER BY created_at DESC`,
  );
  return rows;
}
const whiteLabelRepository = {
  insertProject,
  findById,
  findBySlug,
  listByOwner,
  updateStatus,
  updateProject,
  deleteProject,
  listAll,
};
module.exports.whiteLabelRepository = whiteLabelRepository;

module.exports.insertProject = insertProject;

module.exports.findById = findById;

module.exports.findBySlug = findBySlug;

module.exports.listByOwner = listByOwner;

module.exports.updateStatus = updateStatus;

module.exports.updateProject = updateProject;

module.exports.deleteProject = deleteProject;

module.exports.listAll = listAll;
