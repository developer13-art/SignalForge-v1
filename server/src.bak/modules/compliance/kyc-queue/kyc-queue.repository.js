/**
 * KYC Queue Repository
 *
 * Persistence layer for the compliance KYC review queue.
 *
 * @module server/modules/compliance/kyc-queue/kyc-queue.repository
 */

import { db } from '../../../database';

export async function listQueueItems({ filters = {}, pagination = {} }) {
  const conditions = [];
  const params = [];

  if (filters.status) {
    params.push(filters.status);
    conditions.push(`ka.status = $${params.length}`);
  } else {
    conditions.push(`ka.status IN ('PENDING', 'UNDER_REVIEW', 'REJECTED')`);
  }

  if (filters.assignedReviewerId) {
    params.push(filters.assignedReviewerId);
    conditions.push(`ka.reviewer_id = $${params.length}`);
  }

  if (filters.unassignedOnly) {
    conditions.push(`ka.reviewer_id IS NULL`);
  }

  if (filters.minRiskScore !== undefined) {
    params.push(filters.minRiskScore);
    conditions.push(`ka.risk_score >= $${params.length}`);
  }

  const where = `WHERE ${conditions.join(' AND ')}`;
  const limit = pagination.limit || 20;
  const offset = pagination.offset || 0;

  const { rows } = await db.query(
    `SELECT ka.id, ka.user_id, ka.status, ka.provider, ka.risk_score,
            ka.submitted_at, ka.reviewer_id, ka.sla_due_at,
            u.email AS user_email, u.first_name, u.last_name
       FROM kyc_applications ka
       LEFT JOIN users u ON u.id = ka.user_id
       ${where}
       ORDER BY
         CASE ka.status WHEN 'PENDING' THEN 1 WHEN 'UNDER_REVIEW' THEN 2 ELSE 3 END,
         ka.sla_due_at ASC NULLS LAST,
         ka.submitted_at ASC
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

export async function assignReviewer({ applicationId, reviewerId }) {
  const { rowCount } = await db.query(
    `UPDATE kyc_applications
        SET reviewer_id = $1,
            status = CASE WHEN status = 'PENDING' THEN 'UNDER_REVIEW' ELSE status END,
            updated_at = $2
      WHERE id = $3`,
    [reviewerId, new Date().toISOString(), applicationId],
  );
  return rowCount > 0;
}

export async function releaseReviewer({ applicationId }) {
  const { rowCount } = await db.query(
    `UPDATE kyc_applications
        SET reviewer_id = NULL, updated_at = $1
      WHERE id = $2`,
    [new Date().toISOString(), applicationId],
  );
  return rowCount > 0;
}

export async function countQueueByStatus() {
  const { rows } = await db.query(
    `SELECT status, COUNT(*)::int AS count
       FROM kyc_applications
      WHERE status IN ('PENDING', 'UNDER_REVIEW', 'REJECTED')
      GROUP BY status`,
  );
  return rows;
}

export async function findAssignedToReviewer({ reviewerId, limit = 50 }) {
  const { rows } = await db.query(
    `SELECT id, user_id, status, submitted_at, sla_due_at
       FROM kyc_applications
      WHERE reviewer_id = $1
        AND status = 'UNDER_REVIEW'
      ORDER BY sla_due_at ASC NULLS LAST, submitted_at ASC
      LIMIT $2`,
    [reviewerId, limit],
  );
  return rows;
}

export const kycQueueRepository = {
  listQueueItems,
  assignReviewer,
  releaseReviewer,
  countQueueByStatus,
  findAssignedToReviewer,
};