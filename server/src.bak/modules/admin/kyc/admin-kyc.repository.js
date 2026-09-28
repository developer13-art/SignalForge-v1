/**
 * Admin KYC Repository
 *
 * @module server/modules/admin/kyc/admin-kyc.repository
 */

import { db } from '../../../database';

export async function listKycApplications({ filters = {}, pagination = {} }) {
  const conditions = [];
  const params = [];

  if (filters.status) {
    params.push(filters.status);
    conditions.push(`ka.status = $${params.length}`);
  }

  if (filters.userId) {
    params.push(filters.userId);
    conditions.push(`ka.user_id = $${params.length}`);
  }

  if (filters.reviewerId) {
    params.push(filters.reviewerId);
    conditions.push(`ka.reviewer_id = $${params.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = pagination.limit || 20;
  const offset = pagination.offset || 0;

  const { rows } = await db.query(
    `SELECT ka.id, ka.user_id, ka.status, ka.provider, ka.submitted_at,
            ka.reviewed_at, ka.verified_at, ka.rejection_reason, u.email AS user_email
       FROM kyc_applications ka
       LEFT JOIN users u ON u.id = ka.user_id
       ${where}
       ORDER BY ka.submitted_at DESC NULLS LAST
       LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total FROM kyc_applications ka ${where}`,
    params,
  );

  return {
    items: rows,
    total: countResult.rows[0]?.total || 0,
  };
}

export async function findKycApplicationById({ applicationId }) {
  const { rows } = await db.query(
    `SELECT * FROM kyc_applications WHERE id = $1 LIMIT 1`,
    [applicationId],
  );
  return rows[0] || null;
}

export async function countByStatus() {
  const { rows } = await db.query(
    `SELECT status, COUNT(*)::int AS count
       FROM kyc_applications
      GROUP BY status`,
  );
  return rows;
}

export const adminKycRepository = {
  listKycApplications,
  findKycApplicationById,
  countByStatus,
};