/**
 * Domain Repository
 *
 * Persistence layer for white-label domains.
 *
 * @module server/modules/white-label/domains/domain.repository
 */

import { db } from '../../../database';
import { nowIso } from '@signalforge/shared/utils/date.util';

export async function insertDomain({ projectId, domain, verificationToken }) {
  const { rows } = await db.query(
    `INSERT INTO white_label_domains
       (project_id, domain, status, verification_token, created_at, updated_at)
     VALUES ($1, $2, 'PENDING', $3, $4, $4)
     RETURNING *`,
    [projectId, domain, verificationToken, nowIso()],
  );
  return rows[0];
}

export async function findById({ domainId }) {
  const { rows } = await db.query(
    `SELECT * FROM white_label_domains WHERE id = $1 LIMIT 1`,
    [domainId],
  );
  return rows[0] || null;
}

export async function findByDomain({ domain }) {
  const { rows } = await db.query(
    `SELECT * FROM white_label_domains WHERE domain = $1 LIMIT 1`,
    [domain],
  );
  return rows[0] || null;
}

export async function listByProject({ projectId }) {
  const { rows } = await db.query(
    `SELECT * FROM white_label_domains
      WHERE project_id = $1
      ORDER BY created_at DESC`,
    [projectId],
  );
  return rows;
}

export async function updateStatus({ domainId, status }) {
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

export async function deleteDomain({ domainId, projectId }) {
  const { rowCount } = await db.query(
    `DELETE FROM white_label_domains WHERE id = $1 AND project_id = $2`,
    [domainId, projectId],
  );
  return rowCount > 0;
}

export async function deleteByProject({ projectId }) {
  await db.query(`DELETE FROM white_label_domains WHERE project_id = $1`, [projectId]);
}

export const domainRepository = {
  insertDomain,
  findById,
  findByDomain,
  listByProject,
  updateStatus,
  deleteDomain,
  deleteByProject,
};