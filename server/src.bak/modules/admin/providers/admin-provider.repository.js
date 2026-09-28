/**
 * Admin Provider Repository
 *
 * Persistence layer for administrative provider management.
 *
 * @module server/modules/admin/providers/admin-provider.repository
 */

import { db } from '../../../database';
import { nowIso } from '@signalforge/shared/utils/date.util';

export async function listProviders({ filters = {}, pagination = {} }) {
  const conditions = [];
  const params = [];

  if (filters.status) {
    params.push(filters.status);
    conditions.push(`p.status = $${params.length}`);
  }

  if (filters.certificationStatus) {
    params.push(filters.certificationStatus);
    conditions.push(`p.certification_status = $${params.length}`);
  }

  if (filters.search) {
    params.push(`%${filters.search.toLowerCase()}%`);
    conditions.push(`LOWER(p.display_name) LIKE $${params.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = pagination.limit || 20;
  const offset = pagination.offset || 0;

  const { rows } = await db.query(
    `SELECT p.id, p.user_id, p.display_name, p.status, p.certification_status,
            p.revenue_share_percent, p.subscriber_count, p.created_at,
            u.email AS user_email
       FROM providers p
       LEFT JOIN users u ON u.id = p.user_id
       ${where}
       ORDER BY p.created_at DESC
       LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total FROM providers p ${where}`,
    params,
  );

  return {
    items: rows,
    total: countResult.rows[0]?.total || 0,
  };
}

export async function findProviderById({ providerId }) {
  const { rows } = await db.query(
    `SELECT * FROM providers WHERE id = $1 LIMIT 1`,
    [providerId],
  );
  return rows[0] || null;
}

export async function updateProviderStatus({ providerId, status }) {
  const { rowCount } = await db.query(
    `UPDATE providers SET status = $1, updated_at = $2 WHERE id = $3`,
    [status, nowIso(), providerId],
  );
  return rowCount > 0;
}

export async function updateCertificationStatus({ providerId, status }) {
  const { rowCount } = await db.query(
    `UPDATE providers
        SET certification_status = $1,
            certified_at = CASE WHEN $1 IN ('CERTIFIED', 'CONDITIONALLY_CERTIFIED') THEN $2 ELSE certified_at END,
            updated_at = $2
      WHERE id = $3`,
    [status, nowIso(), providerId],
  );
  return rowCount > 0;
}

export async function countProvidersByStatus() {
  const { rows } = await db.query(
    `SELECT status, COUNT(*)::int AS count FROM providers GROUP BY status`,
  );
  return rows;
}

export const adminProviderRepository = {
  listProviders,
  findProviderById,
  updateProviderStatus,
  updateCertificationStatus,
  countProvidersByStatus,
};