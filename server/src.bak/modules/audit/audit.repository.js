/**
 * Audit Repository
 *
 * Persistence layer for the platform-wide audit log. The audit log is
 * append-only; it is never updated or deleted except by retention
 * policies enforced outside this repository.
 *
 * @module server/modules/audit/audit.repository
 */

import { db } from '../../database';

export async function insertEntry({
  actorId,
  actorType,
  action,
  resourceType,
  resourceId,
  severity,
  details,
  ipAddress,
  userAgent,
  requestId,
  correlationId,
  metadata,
}) {
  const { rows } = await db.query(
    `INSERT INTO audit_logs
       (actor_id, actor_type, action, resource_type, resource_id, severity,
        details, ip_address, user_agent, request_id, correlation_id, metadata, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
     RETURNING *`,
    [
      actorId || null,
      actorType || 'SYSTEM',
      action,
      resourceType || null,
      resourceId || null,
      severity || 'INFO',
      details ? JSON.stringify(details) : null,
      ipAddress || null,
      userAgent || null,
      requestId || null,
      correlationId || null,
      metadata ? JSON.stringify(metadata) : null,
    ],
  );
  return rows[0];
}

export async function insertBatch(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return [];
  }

  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    const inserted = [];

    for (const entry of entries) {
      const { rows } = await client.query(
        `INSERT INTO audit_logs
           (actor_id, actor_type, action, resource_type, resource_id, severity,
            details, ip_address, user_agent, request_id, correlation_id, metadata, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
         RETURNING id`,
        [
          entry.actorId || null,
          entry.actorType || 'SYSTEM',
          entry.action,
          entry.resourceType || null,
          entry.resourceId || null,
          entry.severity || 'INFO',
          entry.details ? JSON.stringify(entry.details) : null,
          entry.ipAddress || null,
          entry.userAgent || null,
          entry.requestId || null,
          entry.correlationId || null,
          entry.metadata ? JSON.stringify(entry.metadata) : null,
        ],
      );
      inserted.push(rows[0].id);
    }

    await client.query('COMMIT');
    return inserted;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function findById({ auditId }) {
  const { rows } = await db.query(
    `SELECT * FROM audit_logs WHERE id = $1 LIMIT 1`,
    [auditId],
  );
  return rows[0] || null;
}

export async function list({ filters = {}, pagination = {} }) {
  const conditions = [];
  const params = [];

  if (filters.actorId) {
    params.push(filters.actorId);
    conditions.push(`actor_id = $${params.length}`);
  }

  if (filters.actorType) {
    params.push(filters.actorType);
    conditions.push(`actor_type = $${params.length}`);
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

  if (filters.severity) {
    params.push(filters.severity);
    conditions.push(`severity = $${params.length}`);
  }

  if (filters.correlationId) {
    params.push(filters.correlationId);
    conditions.push(`correlation_id = $${params.length}`);
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
    `SELECT id, actor_id, actor_type, action, resource_type, resource_id, severity,
            details, ip_address, user_agent, request_id, correlation_id, created_at
       FROM audit_logs
       ${where}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total FROM audit_logs ${where}`,
    params,
  );

  return {
    items: rows,
    total: countResult.rows[0]?.total || 0,
  };
}

export async function listByResource({ resourceType, resourceId, limit = 200 }) {
  const { rows } = await db.query(
    `SELECT id, actor_id, actor_type, action, severity, details, created_at
       FROM audit_logs
      WHERE resource_type = $1 AND resource_id = $2
      ORDER BY created_at ASC
      LIMIT $3`,
    [resourceType, resourceId, limit],
  );
  return rows;
}

export async function listByCorrelation({ correlationId, limit = 500 }) {
  const { rows } = await db.query(
    `SELECT id, actor_id, actor_type, action, resource_type, resource_id, severity,
            details, created_at
       FROM audit_logs
      WHERE correlation_id = $1
      ORDER BY created_at ASC
      LIMIT $2`,
    [correlationId, limit],
  );
  return rows;
}

export async function countByAction({ filters = {} }) {
  const conditions = [];
  const params = [];

  if (filters.from) {
    params.push(filters.from);
    conditions.push(`created_at >= $${params.length}`);
  }

  if (filters.to) {
    params.push(filters.to);
    conditions.push(`created_at <= $${params.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows } = await db.query(
    `SELECT action, COUNT(*)::int AS count
       FROM audit_logs
       ${where}
      GROUP BY action
      ORDER BY count DESC`,
    params,
  );
  return rows;
}

export async function countBySeverity({ filters = {} }) {
  const conditions = [];
  const params = [];

  if (filters.from) {
    params.push(filters.from);
    conditions.push(`created_at >= $${params.length}`);
  }

  if (filters.to) {
    params.push(filters.to);
    conditions.push(`created_at <= $${params.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows } = await db.query(
    `SELECT severity, COUNT(*)::int AS count
       FROM audit_logs
       ${where}
      GROUP BY severity`,
    params,
  );
  return rows;
}

export async function deleteOlderThan({ cutoff }) {
  const { rowCount } = await db.query(
    `DELETE FROM audit_logs WHERE created_at < $1`,
    [cutoff],
  );
  return rowCount;
}

export const auditRepository = {
  insertEntry,
  insertBatch,
  findById,
  list,
  listByResource,
  listByCorrelation,
  countByAction,
  countBySeverity,
  deleteOlderThan,
};