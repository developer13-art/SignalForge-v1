/**
 * Compliance Audit Repository
 *
 * @module server/modules/compliance/audit/compliance-audit.repository
 */

import { db } from '../../../database';
import { nowIso } from '@signalforge/shared/utils/date.util';

export async function insertAuditEntry({
  actorId,
  action,
  resourceType,
  resourceId,
  previousState,
  newState,
  reason,
  ipAddress,
  userAgent,
}) {
  const { rows } = await db.query(
    `INSERT INTO compliance_audit_log
       (actor_id, action, resource_type, resource_id, previous_state, new_state,
        reason, ip_address, user_agent, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      actorId,
      action,
      resourceType || null,
      resourceId || null,
      previousState ? JSON.stringify(previousState) : null,
      newState ? JSON.stringify(newState) : null,
      reason || null,
      ipAddress || null,
      userAgent || null,
      nowIso(),
    ],
  );
  return rows[0];
}

export async function listEntries({ filters = {}, pagination = {} }) {
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

  if (filters.resourceType) {
    params.push(filters.resourceType);
    conditions.push(`resource_type = $${params.length}`);
  }

  if (filters.resourceId) {
    params.push(filters.resourceId);
    conditions.push(`resource_id = $${params.length}`);
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
    `SELECT * FROM compliance_audit_log
       ${where}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total FROM compliance_audit_log ${where}`,
    params,
  );

  return {
    items: rows,
    total: countResult.rows[0]?.total || 0,
  };
}

export async function findByResource({ resourceType, resourceId }) {
  const { rows } = await db.query(
    `SELECT * FROM compliance_audit_log
      WHERE resource_type = $1 AND resource_id = $2
      ORDER BY created_at ASC`,
    [resourceType, resourceId],
  );
  return rows;
}

export async function countActionsByActor({ actorId, since }) {
  const params = [actorId];
  let where = `WHERE actor_id = $1`;

  if (since) {
    params.push(since);
    where += ` AND created_at >= $2`;
  }

  const { rows } = await db.query(
    `SELECT action, COUNT(*)::int AS count
       FROM compliance_audit_log
       ${where}
      GROUP BY action`,
    params,
  );
  return rows;
}

export const complianceAuditRepository = {
  insertAuditEntry,
  listEntries,
  findByResource,
  countActionsByActor,
};