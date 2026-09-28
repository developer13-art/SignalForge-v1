/**
 * Domain Repository
 *
 * Persistence layer for white-label domains.
 *
 * @module server/modules/white-label/domains/domain.repository
 */
const { db } = require('../../../database');
const { nowIso } = require('@signalforge/shared/utils/date.util');
async function insertDomain({ projectId, domain, verificationToken }) {
  const { rows } = await db.query(
    `INSERT INTO white_label_domains
       (project_id, domain, status, verification_token, created_at, updated_at)
     VALUES ($1, $2, 'PENDING', $3, $4, $4)
     RETURNING *`,
    [projectId, domain, verificationToken, nowIso()],
  );
  return rows[0];
}
async function findById({ domainId }) {
  const { rows } = await db.query(
    `SELECT * FROM white_label_domains WHERE id = $1 LIMIT 1`,
    [domainId],
  );
  return rows[0] || null;
}
async function findByDomain({ domain }) {
  const { rows } = await db.query(
    `SELECT * FROM white_label_domains WHERE domain = $1 LIMIT 1`,
    [domain],
  );
  return rows[0] || null;
}
async function listByProject({ projectId }) {
  const { rows } = await db.query(
    `SELECT * FROM white_label_domains
      WHERE project_id = $1
      ORDER BY created_at DESC`,
    [projectId],
  );
  return rows;
}
async function updateStatus({ domainId, status }) {
  const { rowCount } = await db.query(
    `UPDATE white_label_domains
        SET status = $1,
            verified_at = CASE WHEN $1 = 'VERIFIED' THEN $2 ELSE verified_at END,
            updated_at = $2
      WHERE id = $3`,
    [status, nowIso(), domainId],
  );
  return rowCount > 0;
}
async function deleteDomain({ domainId, projectId }) {
  const { rowCount } = await db.query(
    `DELETE FROM white_label_domains WHERE id = $1 AND project_id = $2`,
    [domainId, projectId],
  );
  return rowCount > 0;
}
async function deleteByProject({ projectId }) {
  await db.query(`DELETE FROM white_label_domains WHERE project_id = $1`, [projectId]);
}
const domainRepository = {
  insertDomain,
  findById,
  findByDomain,
  listByProject,
  updateStatus,
  deleteDomain,
  deleteByProject,
};
module.exports.domainRepository = domainRepository;

module.exports.insertDomain = insertDomain;

module.exports.findById = findById;

module.exports.findByDomain = findByDomain;

module.exports.listByProject = listByProject;

module.exports.updateStatus = updateStatus;

module.exports.deleteDomain = deleteDomain;

module.exports.deleteByProject = deleteByProject;
