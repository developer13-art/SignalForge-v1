/**
 * Ticket Repository
 *
 * Persistence layer for support tickets, messages, and assignments.
 *
 * @module server/modules/support/ticket.repository
 */

import { db } from '../../database';
import { nowIso } from '@signalforge/shared/utils/date.util';

export async function insertTicket({
  userId,
  subject,
  priority,
  category,
  source,
  assignedAgentId,
  metadata,
  responseDueAt,
  resolutionDueAt,
}) {
  const { rows } = await db.query(
    `INSERT INTO support_tickets
       (user_id, subject, status, priority, category, source,
        assigned_agent_id, metadata, response_due_at, resolution_due_at,
        created_at, updated_at)
     VALUES ($1, $2, 'OPEN', $3, $4, $5, $6, $7, $8, $9, $10, $10)
     RETURNING *`,
    [
      userId,
      subject,
      priority,
      category,
      source || 'WEB',
      assignedAgentId || null,
      metadata ? JSON.stringify(metadata) : null,
      responseDueAt || null,
      resolutionDueAt || null,
      nowIso(),
    ],
  );
  return rows[0];
}

export async function findById({ ticketId }) {
  const { rows } = await db.query(
    `SELECT * FROM support_tickets WHERE id = $1 LIMIT 1`,
    [ticketId],
  );
  return rows[0] || null;
}

export async function findByNumber({ ticketNumber }) {
  const { rows } = await db.query(
    `SELECT * FROM support_tickets WHERE ticket_number = $1 LIMIT 1`,
    [ticketNumber],
  );
  return rows[0] || null;
}

export async function listByUser({ userId, filters = {}, pagination = {} }) {
  const conditions = ['user_id = $1'];
  const params = [userId];

  if (filters.status) {
    params.push(filters.status);
    conditions.push(`status = $${params.length}`);
  }

  if (filters.category) {
    params.push(filters.category);
    conditions.push(`category = $${params.length}`);
  }

  if (filters.priority) {
    params.push(filters.priority);
    conditions.push(`priority = $${params.length}`);
  }

  const where = `WHERE ${conditions.join(' AND ')}`;
  const limit = pagination.limit || 20;
  const offset = pagination.offset || 0;

  const { rows } = await db.query(
    `SELECT * FROM support_tickets
       ${where}
       ORDER BY
         CASE priority
           WHEN 'URGENT' THEN 100
           WHEN 'HIGH' THEN 80
           WHEN 'NORMAL' THEN 50
           ELSE 10
         END DESC,
         updated_at DESC
       LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total FROM support_tickets ${where}`,
    params,
  );

  return {
    items: rows,
    total: countResult.rows[0]?.total || 0,
  };
}

export async function listAssignedToAgent({ agentId, filters = {}, pagination = {} }) {
  const conditions = ['assigned_agent_id = $1'];
  const params = [agentId];

  if (filters.status) {
    params.push(filters.status);
    conditions.push(`status = $${params.length}`);
  }

  const where = `WHERE ${conditions.join(' AND ')}`;
  const limit = pagination.limit || 20;
  const offset = pagination.offset || 0;

  const { rows } = await db.query(
    `SELECT * FROM support_tickets
       ${where}
       ORDER BY response_due_at ASC NULLS LAST, updated_at DESC
       LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total FROM support_tickets ${where}`,
    params,
  );

  return {
    items: rows,
    total: countResult.rows[0]?.total || 0,
  };
}

export async function listByQueue({ filters = {}, pagination = {} }) {
  const conditions = [];
  const params = [];

  if (filters.status) {
    params.push(filters.status);
    conditions.push(`status = $${params.length}`);
  } else {
    conditions.push(`status IN ('OPEN', 'PENDING_AGENT', 'ESCALATED', 'REOPENED')`);
  }

  if (filters.priority) {
    params.push(filters.priority);
    conditions.push(`priority = $${params.length}`);
  }

  if (filters.category) {
    params.push(filters.category);
    conditions.push(`category = $${params.length}`);
  }

  if (filters.unassignedOnly) {
    conditions.push(`assigned_agent_id IS NULL`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = pagination.limit || 20;
  const offset = pagination.offset || 0;

  const { rows } = await db.query(
    `SELECT * FROM support_tickets
       ${where}
       ORDER BY
         CASE priority
           WHEN 'URGENT' THEN 100
           WHEN 'HIGH' THEN 80
           WHEN 'NORMAL' THEN 50
           ELSE 10
         END DESC,
         response_due_at ASC NULLS LAST,
         created_at ASC
       LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total FROM support_tickets ${where}`,
    params,
  );

  return {
    items: rows,
    total: countResult.rows[0]?.total || 0,
  };
}

export async function updateStatus({ ticketId, status, reason }) {
  const { rowCount } = await db.query(
    `UPDATE support_tickets
        SET status = $1,
            status_reason = $2,
            resolved_at = CASE WHEN $1 IN ('RESOLVED', 'CLOSED') THEN $3 ELSE resolved_at END,
            updated_at = $3
      WHERE id = $4`,
    [status, reason || null, nowIso(), ticketId],
  );
  return rowCount > 0;
}

export async function updatePriority({ ticketId, priority }) {
  const { rowCount } = await db.query(
    `UPDATE support_tickets
        SET priority = $1, updated_at = $2
      WHERE id = $3`,
    [priority, nowIso(), ticketId],
  );
  return rowCount > 0;
}

export async function assignAgent({ ticketId, agentId }) {
  const { rowCount } = await db.query(
    `UPDATE support_tickets
        SET assigned_agent_id = $1, updated_at = $2
      WHERE id = $3`,
    [agentId, nowIso(), ticketId],
  );
  return rowCount > 0;
}

export async function touchFirstResponse({ ticketId }) {
  const { rowCount } = await db.query(
    `UPDATE support_tickets
        SET first_responded_at = COALESCE(first_responded_at, $1),
            updated_at = $1
      WHERE id = $2`,
    [nowIso(), ticketId],
  );
  return rowCount > 0;
}

export async function incrementReopenedCount({ ticketId }) {
  await db.query(
    `UPDATE support_tickets
        SET reopened_count = reopened_count + 1,
            updated_at = $1
      WHERE id = $2`,
    [nowIso(), ticketId],
  );
}

export async function insertMessage({
  ticketId,
  authorId,
  authorType,
  body,
  attachments,
}) {
  const { rows } = await db.query(
    `INSERT INTO support_messages
       (ticket_id, author_id, author_type, body, attachments, created_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      ticketId,
      authorId || null,
      authorType,
      body,
      attachments ? JSON.stringify(attachments) : null,
      nowIso(),
    ],
  );
  return rows[0];
}

export async function listMessages({ ticketId }) {
  const { rows } = await db.query(
    `SELECT * FROM support_messages
      WHERE ticket_id = $1
      ORDER BY created_at ASC`,
    [ticketId],
  );
  return rows;
}

export async function findMessageById({ messageId }) {
  const { rows } = await db.query(
    `SELECT * FROM support_messages WHERE id = $1 LIMIT 1`,
    [messageId],
  );
  return rows[0] || null;
}

export async function listSlaBreaches({ limit = 100 }) {
  const { rows } = await db.query(
    `SELECT * FROM support_tickets
      WHERE status NOT IN ('RESOLVED', 'CLOSED')
        AND (
          (response_due_at IS NOT NULL AND first_responded_at IS NULL AND response_due_at < $1)
          OR
          (resolution_due_at IS NOT NULL AND resolved_at IS NULL AND resolution_due_at < $1)
        )
      ORDER BY
        CASE WHEN response_due_at < $1 AND first_responded_at IS NULL THEN 1 ELSE 2 END,
        response_due_at ASC NULLS LAST,
        resolution_due_at ASC NULLS LAST
      LIMIT $2`,
    [nowIso(), limit],
  );
  return rows;
}

export async function countByStatusForUser({ userId }) {
  const { rows } = await db.query(
    `SELECT status, COUNT(*)::int AS count
       FROM support_tickets
      WHERE user_id = $1
      GROUP BY status`,
    [userId],
  );
  return rows;
}

export async function countByStatusForAgent({ agentId }) {
  const { rows } = await db.query(
    `SELECT status, COUNT(*)::int AS count
       FROM support_tickets
      WHERE assigned_agent_id = $1
      GROUP BY status`,
    [agentId],
  );
  return rows;
}

export async function countAllByStatus() {
  const { rows } = await db.query(
    `SELECT status, COUNT(*)::int AS count
       FROM support_tickets
      GROUP BY status`,
  );
  return rows;
}

export const ticketRepository = {
  insertTicket,
  findById,
  findByNumber,
  listByUser,
  listAssignedToAgent,
  listByQueue,
  updateStatus,
  updatePriority,
  assignAgent,
  touchFirstResponse,
  incrementReopenedCount,
  insertMessage,
  listMessages,
  findMessageById,
  listSlaBreaches,
  countByStatusForUser,
  countByStatusForAgent,
  countAllByStatus,
};