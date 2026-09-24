/**
 * Event Store
 *
 * Persists every published event to the database for audit and
 * replay. The store is append-only. It is not a substitute for the
 * domain-specific event tables; it is the raw event log.
 *
 * @module server/events/event-store
 */

import { db } from '../database';
import { nowIso } from '@signalforge/shared/utils/date.util';
import { logger } from '../lib/logger';

export async function storeEvent({
  eventId,
  eventType,
  source,
  actorId,
  actorType,
  payload,
  correlationId,
  causationId,
  tenantId,
  metadata,
}) {
  if (!eventId || !eventType) {
    throw new Error('eventId and eventType are required');
  }

  try {
    const { rows } = await db.query(
      `INSERT INTO event_store
         (id, event_type, source, actor_id, actor_type, payload,
          correlation_id, causation_id, tenant_id, metadata, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (id) DO NOTHING
       RETURNING id`,
      [
        eventId,
        eventType,
        source || null,
        actorId || null,
        actorType || null,
        payload ? JSON.stringify(payload) : null,
        correlationId || null,
        causationId || null,
        tenantId || null,
        metadata ? JSON.stringify(metadata) : null,
        nowIso(),
      ],
    );
    return rows[0] || null;
  } catch (err) {
    logger.error({ err, eventId, eventType }, 'Failed to persist event to event_store');
    return null;
  }
}

export async function findStoredEventById({ eventId }) {
  if (!eventId) {
    throw new Error('eventId is required');
  }

  const { rows } = await db.query(
    `SELECT * FROM event_store WHERE id = $1 LIMIT 1`,
    [eventId],
  );

  return rows[0] || null;
}

export async function listStoredEvents({ filters = {}, pagination = {} }) {
  const conditions = [];
  const params = [];

  if (filters.eventType) {
    params.push(filters.eventType);
    conditions.push(`event_type = $${params.length}`);
  }

  if (filters.source) {
    params.push(filters.source);
    conditions.push(`source = $${params.length}`);
  }

  if (filters.actorId) {
    params.push(filters.actorId);
    conditions.push(`actor_id = $${params.length}`);
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
    `SELECT * FROM event_store
       ${where}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total FROM event_store ${where}`,
    params,
  );

  return {
    items: rows,
    total: countResult.rows[0]?.total || 0,
  };
}

export async function deleteStoredEventsOlderThan({ cutoff }) {
  if (!cutoff) {
    throw new Error('cutoff is required');
  }

  const { rowCount } = await db.query(
    `DELETE FROM event_store WHERE created_at < $1`,
    [cutoff],
  );

  return rowCount;
}

export const eventStore = {
  storeEvent,
  findStoredEventById,
  listStoredEvents,
  deleteStoredEventsOlderThan,
};