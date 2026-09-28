/**
 * Compliance Repository
 *
 * Cross-cutting queries for compliance operations that do not belong
 * to a single sub-module. Handles aggregate counters and audit-log
 * retrieval.
 *
 * @module server/modules/compliance/compliance.repository
 */

import { db } from '../../database';

export async function countKycApplicationsByStatus() {
  const { rows } = await db.query(
    `SELECT status, COUNT(*)::int AS count
       FROM kyc_applications
      GROUP BY status`,
  );
  return rows;
}

export async function countOpenRiskFlags({ minSeverity } = {}) {
  const params = [];
  let where = `WHERE resolved_at IS NULL`;

  if (minSeverity) {
    params.push(minSeverity);
    where += ` AND severity = $1`;
  }

  const { rows } = await db.query(
    `SELECT COUNT(*)::int AS count FROM kyc_risk_flags ${where}`,
    params,
  );
  return rows[0]?.count || 0;
}

export async function findApplicationsExceedingSla({ hours = 48, limit = 100 }) {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

  const { rows } = await db.query(
    `SELECT id, user_id, status, submitted_at
       FROM kyc_applications
      WHERE status IN ('UNDER_REVIEW', 'PENDING')
        AND submitted_at IS NOT NULL
        AND submitted_at < $1
      ORDER BY submitted_at ASC
      LIMIT $2`,
    [cutoff, limit],
  );

  return rows;
}

export async function listAuditLogs({ filters = {}, pagination = {} }) {
  const conditions = [];
  const params = [];

  if (filters.actorId) {
    params.push(filters.actorId);
    conditions.push(`actor_id = $${params.length}`);
  }

  if (filters.action) {
    params.push(filters.action);
    conditions.push(`action = $${params.length}`);
  }

  if (filters.from) {
    params.push(filters.from);
    conditions.push(`created_at >= $${params.length}`);
  }

  if (filters.to) {
    params.push(filters.to);
    conditions.push(`created_at <= $${params.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = pagination.limit || 50;
  const offset = pagination.offset || 0;

  const { rows } = await db.query(
    `SELECT id, actor_id, action, resource_type, resource_id, old_value, new_value, reason, created_at
       FROM kyc_audit_logs
       ${where}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total FROM kyc_audit_logs ${where}`,
    params,
  );

  return {
    items: rows,
    total: countResult.rows[0]?.total || 0,
  };
}

export async function insertAuditLog({
  actorId,
  action,
  resourceType,
  resourceId,
  oldValue,
  newValue,
  reason,
}) {
  const { rows } = await db.query(
    `INSERT INTO kyc_audit_logs
       (actor_id, action, resource_type, resource_id, old_value, new_value, reason, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      actorId || null,
      action,
      resourceType || null,
      resourceId || null,
      oldValue !== undefined ? JSON.stringify(oldValue) : null,
      newValue !== undefined ? JSON.stringify(newValue) : null,
      reason || null,
      new Date().toISOString(),
    ],
  );
  return rows[0];
}

export const complianceRepository = {
  countKycApplicationsByStatus,
  countOpenRiskFlags,
  findApplicationsExceedingSla,
  listAuditLogs,
  insertAuditLog,
};