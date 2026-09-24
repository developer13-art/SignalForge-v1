/**
 * Risk Flag Repository
 *
 * @module server/modules/compliance/risk-flags/risk-flag.repository
 */

import { db } from '../../../database';
import { nowIso } from '@signalforge/shared/utils/date.util';

export async function insertRiskFlag({
  applicationId,
  userId,
  flagType,
  severity,
  details,
  createdBy,
}) {
  const { rows } = await db.query(
    `INSERT INTO kyc_risk_flags
       (application_id, user_id, flag_type, severity, details, created_by, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      applicationId,
      userId || null,
      flagType,
      severity,
      details ? JSON.stringify(details) : null,
      createdBy || null,
      nowIso(),
    ],
  );
  return rows[0];
}

export async function findById({ flagId }) {
  const { rows } = await db.query(
    `SELECT * FROM kyc_risk_flags WHERE id = $1 LIMIT 1`,
    [flagId],
  );
  return rows[0] || null;
}

export async function listByApplication({ applicationId }) {
  const { rows } = await db.query(
    `SELECT * FROM kyc_risk_flags
      WHERE application_id = $1
      ORDER BY created_at DESC`,
    [applicationId],
  );
  return rows;
}

export async function listOpen({ filters = {}, pagination = {} }) {
  const conditions = ['resolved_at IS NULL'];
  const params = [];

  if (filters.severity) {
    params.push(filters.severity);
    conditions.push(`severity = $${params.length}`);
  }

  if (filters.flagType) {
    params.push(filters.flagType);
    conditions.push(`flag_type = $${params.length}`);
  }

  if (filters.userId) {
    params.push(filters.userId);
    conditions.push(`user_id = $${params.length}`);
  }

  const where = `WHERE ${conditions.join(' AND ')}`;
  const limit = pagination.limit || 20;
  const offset = pagination.offset || 0;

  const { rows } = await db.query(
    `SELECT * FROM kyc_risk_flags
       ${where}
       ORDER BY
         CASE severity
           WHEN 'CRITICAL' THEN 100
           WHEN 'HIGH' THEN 80
           WHEN 'MEDIUM' THEN 50
           ELSE 10
         END DESC,
         created_at DESC
       LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total FROM kyc_risk_flags ${where}`,
    params,
  );

  return {
    items: rows,
    total: countResult.rows[0]?.total || 0,
  };
}

export async function resolveFlag({ flagId, resolvedBy, resolutionNotes }) {
  const { rowCount } = await db.query(
    `UPDATE kyc_risk_flags
        SET resolved_at = $1,
            resolved_by = $2,
            resolution_notes = $3
      WHERE id = $4 AND resolved_at IS NULL`,
    [nowIso(), resolvedBy, resolutionNotes || null, flagId],
  );
  return rowCount > 0;
}

export async function countBySeverity() {
  const { rows } = await db.query(
    `SELECT severity, COUNT(*)::int AS count
       FROM kyc_risk_flags
      WHERE resolved_at IS NULL
      GROUP BY severity`,
  );
  return rows;
}

export const riskFlagRepository = {
  insertRiskFlag,
  findById,
  listByApplication,
  listOpen,
  resolveFlag,
  countBySeverity,
};