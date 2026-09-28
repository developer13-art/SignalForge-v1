/**
 * Notification Repository
 *
 * Persistence layer for notifications and delivery attempts.
 *
 * @module server/modules/notifications/notification.repository
 */

import { db } from '../../database';
import { nowIso } from '@signalforge/shared/utils/date.util';

export async function insertNotification({
  userId,
  type,
  category,
  priority,
  title,
  body,
  channels,
  templateKey,
  templateData,
  actionUrl,
  actionLabel,
  referenceType,
  referenceId,
  expiresAt,
  scheduledFor,
  metadata,
}) {
  const { rows } = await db.query(
    `INSERT INTO notifications
       (user_id, type, category, priority, title, body, channels,
        template_key, template_data, action_url, action_label,
        reference_type, reference_id, status, expires_at, scheduled_for,
        metadata, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'QUEUED', $14, $15, $16, $17, $17)
     RETURNING *`,
    [
      userId,
      type,
      category || null,
      priority || 'NORMAL',
      title,
      body || null,
      JSON.stringify(channels || []),
      templateKey || null,
      templateData ? JSON.stringify(templateData) : null,
      actionUrl || null,
      actionLabel || null,
      referenceType || null,
      referenceId || null,
      expiresAt || null,
      scheduledFor || null,
      metadata ? JSON.stringify(metadata) : null,
      nowIso(),
    ],
  );
  return rows[0];
}

export async function findById({ notificationId }) {
  const { rows } = await db.query(
    `SELECT * FROM notifications WHERE id = $1 LIMIT 1`,
    [notificationId],
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

  if (filters.unreadOnly) {
    conditions.push(`read_at IS NULL`);
  }

  if (filters.from) {
    params.push(filters.from);
    conditions.push(`created_at >= $${params.length}`);
  }

  if (filters.to) {
    params.push(filters.to);
    conditions.push(`created_at <= $${params.length}`);
  }

  const where = `WHERE ${conditions.join(' AND ')}`;
  const limit = pagination.limit || 20;
  const offset = pagination.offset || 0;

  const { rows } = await db.query(
    `SELECT * FROM notifications
       ${where}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total FROM notifications ${where}`,
    params,
  );

  return {
    items: rows,
    total: countResult.rows[0]?.total || 0,
  };
}

export async function updateStatus({ notificationId, status }) {
  const { rowCount } = await db.query(
    `UPDATE notifications
        SET status = $1, updated_at = $2
      WHERE id = $3`,
    [status, nowIso(), notificationId],
  );
  return rowCount > 0;
}

export async function markAsRead({ notificationId, userId }) {
  const { rowCount } = await db.query(
    `UPDATE notifications
        SET read_at = $1, updated_at = $1
      WHERE id = $2 AND user_id = $3 AND read_at IS NULL`,
    [nowIso(), notificationId, userId],
  );
  return rowCount > 0;
}

export async function markAllAsRead({ userId }) {
  const { rowCount } = await db.query(
    `UPDATE notifications
        SET read_at = $1, updated_at = $1
      WHERE user_id = $2 AND read_at IS NULL`,
    [nowIso(), userId],
  );
  return rowCount;
}

export async function countUnread({ userId }) {
  const { rows } = await db.query(
    `SELECT COUNT(*)::int AS count
       FROM notifications
      WHERE user_id = $1 AND read_at IS NULL`,
    [userId],
  );
  return rows[0]?.count || 0;
}

export async function deleteNotification({ notificationId, userId }) {
  const { rowCount } = await db.query(
    `DELETE FROM notifications WHERE id = $1 AND user_id = $2`,
    [notificationId, userId],
  );
  return rowCount > 0;
}

export async function insertDelivery({
  notificationId,
  channel,
  status,
  attempt,
  error,
  providerReference,
}) {
  const { rows } = await db.query(
    `INSERT INTO notification_deliveries
       (notification_id, channel, status, attempt, error, provider_reference, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
     RETURNING *`,
    [notificationId, channel, status, attempt || 1, error || null, providerReference || null, nowIso()],
  );
  return rows[0];
}

export async function listDeliveries({ notificationId }) {
  const { rows } = await db.query(
    `SELECT * FROM notification_deliveries
      WHERE notification_id = $1
      ORDER BY created_at ASC`,
    [notificationId],
  );
  return rows;
}

export async function findPendingForScheduledDelivery({ limit = 100 }) {
  const { rows } = await db.query(
    `SELECT * FROM notifications
      WHERE status IN ('QUEUED', 'FAILED')
        AND (scheduled_for IS NULL OR scheduled_for <= $1)
        AND (expires_at IS NULL OR expires_at > $1)
      ORDER BY
        CASE priority
          WHEN 'CRITICAL' THEN 100
          WHEN 'HIGH' THEN 80
          WHEN 'NORMAL' THEN 50
          ELSE 10
        END DESC,
        created_at ASC
      LIMIT $2`,
    [nowIso(), limit],
  );
  return rows;
}

export const notificationRepository = {
  insertNotification,
  findById,
  listByUser,
  updateStatus,
  markAsRead,
  markAllAsRead,
  countUnread,
  deleteNotification,
  insertDelivery,
  listDeliveries,
  findPendingForScheduledDelivery,
};