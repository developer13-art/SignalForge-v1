/**
 * Notification Service
 *
 * Top-level orchestration for notifications. Persists notifications,
 * resolves user preferences, dispatches to channels via the channel
 * factory, tracks delivery attempts, and emits platform events.
 *
 * @module server/modules/notifications/notification.service
 */

import { AppError } from '../../lib/errors/app-error';
import { ERROR_CODES } from '../../lib/errors/error-codes';
import { logger } from '../../lib/logger';
import { db } from '../../database';
import { nowIso } from '@signalforge/shared/utils/date.util';
import { NOTIFICATION_STATUSES, CHANNEL_STATUSES, MAX_RETRY_ATTEMPTS, CHANNEL_RETRY_DELAYS_MS, NOTIFICATION_EXPIRY_HOURS } from './notification.constants';
import * as repository from './notification.repository';
import { channelFactory } from './channels/channel.factory';
import { preferenceService } from './preferences/preference.service';
import {
  emitNotificationQueued,
  emitNotificationSent,
  emitNotificationFailed,
} from './notification.events';

async function loadUser({ userId }) {
  const { rows } = await db.query(
    `SELECT id, email, phone, status, first_name, last_name
       FROM users
      WHERE id = $1
      LIMIT 1`,
    [userId],
  );
  return rows[0] || null;
}

function channelSupportsCategory({ channelName, category, preferences }) {
  if (!preferences) {
    return true;
  }

  if (Array.isArray(preferences.mutedCategories) && category && preferences.mutedCategories.includes(category)) {
    return false;
  }

  if (Array.isArray(preferences.channels) && preferences.channels.length > 0) {
    return preferences.channels.includes(channelName);
  }

  return true;
}

function isInQuietHours({ preferences }) {
  if (!preferences) {
    return false;
  }

  if (!preferences.quiet_hours_start || !preferences.quiet_hours_end) {
    return false;
  }

  const now = new Date();
  const currentMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();

  const [startH, startM] = preferences.quiet_hours_start.split(':').map(Number);
  const [endH, endM] = preferences.quiet_hours_end.split(':').map(Number);

  const start = startH * 60 + startM;
  const end = endH * 60 + endM;

  if (start <= end) {
    return currentMinutes >= start && currentMinutes < end;
  }

  return currentMinutes >= start || currentMinutes < end;
}

async function deliverToChannel({ notification, user, channelName, templateData, preferences, attempt = 1 }) {
  const channel = channelFactory.getChannel(channelName);

  try {
    const available = await channel.isAvailable({ user });

    if (!available) {
      await repository.insertDelivery({
        notificationId: notification.id,
        channel: channelName,
        status: CHANNEL_STATUSES.SKIPPED,
        attempt,
        error: 'CHANNEL_UNAVAILABLE',
      });

      return { channel: channelName, status: CHANNEL_STATUSES.SKIPPED, reason: 'CHANNEL_UNAVAILABLE' };
    }

    const result = await channel.send({ notification, user, templateData });

    if (result && result.skipped) {
      await repository.insertDelivery({
        notificationId: notification.id,
        channel: channelName,
        status: CHANNEL_STATUSES.SKIPPED,
        attempt,
        error: result.reason || null,
      });

      return { channel: channelName, status: CHANNEL_STATUSES.SKIPPED, reason: result.reason || null };
    }

    await repository.insertDelivery({
      notificationId: notification.id,
      channel: channelName,
      status: CHANNEL_STATUSES.SENT,
      attempt,
      providerReference: result ? result.providerReference : null,
    });

    await emitNotificationSent({
      notificationId: notification.id,
      userId: user.id,
      type: notification.type,
      channel: channelName,
    }).catch((err) => logger.warn({ err }, 'Failed to emit notification sent event'));

    return { channel: channelName, status: CHANNEL_STATUSES.SENT };
  } catch (err) {
    logger.warn({ err, channelName, notificationId: notification.id }, 'Channel delivery failed');

    await repository.insertDelivery({
      notificationId: notification.id,
      channel: channelName,
      status: CHANNEL_STATUSES.FAILED,
      attempt,
      error: err.message,
    });

    return { channel: channelName, status: CHANNEL_STATUSES.FAILED, error: err.message };
  }
}

export async function sendNotification(payload) {
  if (!payload.userId || !payload.type || !payload.title) {
    throw new AppError('userId, type, and title are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const user = await loadUser({ userId: payload.userId });

  if (!user) {
    throw new AppError('User not found', ERROR_CODES.NOT_FOUND, 404);
  }

  const expiresAt = payload.expiresAt || new Date(Date.now() + NOTIFICATION_EXPIRY_HOURS * 3600 * 1000).toISOString();

  const record = await repository.insertNotification({
    userId: payload.userId,
    type: payload.type,
    category: payload.category || null,
    priority: payload.priority || 'NORMAL',
    title: payload.title,
    body: payload.body || null,
    channels: payload.channels,
    templateKey: payload.templateKey || null,
    templateData: payload.templateData || null,
    actionUrl: payload.actionUrl || null,
    actionLabel: payload.actionLabel || null,
    referenceType: payload.referenceType || null,
    referenceId: payload.referenceId || null,
    expiresAt,
    scheduledFor: payload.scheduledFor || null,
    metadata: payload.metadata || null,
  });

  await emitNotificationQueued({
    notificationId: record.id,
    userId: record.user_id,
    type: record.type,
    channels: payload.channels,
  }).catch((err) => logger.warn({ err }, 'Failed to emit notification queued event'));

  if (!payload.scheduledFor) {
    await dispatch({ notificationId: record.id });
  }

  return {
    notificationId: record.id,
    userId: record.user_id,
    type: record.type,
    status: record.status,
    createdAt: record.created_at,
  };
}

export async function dispatch({ notificationId }) {
  if (!notificationId) {
    throw new AppError('notificationId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const notification = await repository.findById({ notificationId });

  if (!notification) {
    throw new AppError('Notification not found', ERROR_CODES.NOT_FOUND, 404);
  }

  if (notification.status === NOTIFICATION_STATUSES.SENT || notification.status === NOTIFICATION_STATUSES.DELIVERED) {
    return { dispatched: false, reason: 'ALREADY_DELIVERED' };
  }

  if (notification.expires_at && new Date(notification.expires_at).getTime() < Date.now()) {
    await repository.updateStatus({ notificationId, status: NOTIFICATION_STATUSES.CANCELLED });
    return { dispatched: false, reason: 'EXPIRED' };
  }

  const user = await loadUser({ userId: notification.user_id });

  if (!user) {
    await repository.updateStatus({ notificationId, status: NOTIFICATION_STATUSES.FAILED });
    return { dispatched: false, reason: 'USER_NOT_FOUND' };
  }

  const channels = typeof notification.channels === 'string'
    ? JSON.parse(notification.channels)
    : (notification.channels || []);

  const templateData = notification.template_data
    ? (typeof notification.template_data === 'string' ? JSON.parse(notification.template_data) : notification.template_data)
    : {};

  const preferences = await preferenceService.getPreferences({ userId: notification.user_id }).catch(() => null);

  const isQuiet = isInQuietHours({ preferences });

  if (isQuiet && notification.priority !== 'CRITICAL') {
    logger.debug({ notificationId, userId: user.id }, 'Notification deferred due to quiet hours');
    return { dispatched: false, reason: 'QUIET_HOURS' };
  }

  await repository.updateStatus({ notificationId, status: NOTIFICATION_STATUSES.SENDING });

  const results = [];

  for (const channelName of channels) {
    if (!channelSupportsCategory({ channelName, category: notification.category, preferences })) {
      results.push({ channel: channelName, status: CHANNEL_STATUSES.SKIPPED, reason: 'PREFERENCE_EXCLUDED' });
      continue;
    }

    const result = await deliverToChannel({
      notification,
      user,
      channelName,
      templateData,
      preferences,
    });

    results.push(result);
  }

  const anySent = results.some((r) => r.status === CHANNEL_STATUSES.SENT);

  if (anySent) {
    await repository.updateStatus({ notificationId, status: NOTIFICATION_STATUSES.SENT });
  } else {
    const allSkipped = results.every((r) => r.status === CHANNEL_STATUSES.SKIPPED);

    if (allSkipped) {
      await repository.updateStatus({ notificationId, status: NOTIFICATION_STATUSES.SENT });
    } else {
      await repository.updateStatus({ notificationId, status: NOTIFICATION_STATUSES.FAILED });

      await emitNotificationFailed({
        notificationId,
        userId: user.id,
        type: notification.type,
        channel: results.map((r) => r.channel).join(','),
        reason: results.map((r) => r.error || r.reason).filter(Boolean).join('; ') || null,
      }).catch((err) => logger.warn({ err }, 'Failed to emit notification failed event'));
    }
  }

  logger.info(
    { notificationId, userId: user.id, results },
    'Notification dispatch complete',
  );

  return { dispatched: true, results };
}

export async function retryFailed({ notificationId, attempt }) {
  if (!notificationId) {
    throw new AppError('notificationId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const notification = await repository.findById({ notificationId });

  if (!notification) {
    throw new AppError('Notification not found', ERROR_CODES.NOT_FOUND, 404);
  }

  if (notification.status !== NOTIFICATION_STATUSES.FAILED) {
    return { retried: false, reason: 'NOT_FAILED' };
  }

  const currentAttempt = attempt || 1;

  if (currentAttempt > MAX_RETRY_ATTEMPTS) {
    logger.warn({ notificationId }, 'Notification retry attempts exhausted');
    return { retried: false, reason: 'MAX_ATTEMPTS' };
  }

  return dispatch({ notificationId });
}

export async function sendBulkNotifications({ userIds, type, title, body, channels, category, priority, templateKey, templateData }) {
  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw new AppError('userIds must be a non-empty array', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const results = [];

  for (const userId of userIds) {
    try {
      const result = await sendNotification({
        userId,
        type,
        title,
        body,
        channels,
        category,
        priority,
        templateKey,
        templateData,
      });
      results.push({ userId, ...result });
    } catch (err) {
      logger.warn({ err, userId }, 'Bulk notification failed for user');
      results.push({ userId, error: err.message });
    }
  }

  return { total: results.length, results };
}

export async function listUserNotifications({ userId, filters = {}, pagination = {} }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const result = await repository.listByUser({ userId, filters, pagination });

  return {
    items: result.items.map((row) => ({
      notificationId: row.id,
      type: row.type,
      category: row.category,
      priority: row.priority,
      title: row.title,
      body: row.body,
      status: row.status,
      actionUrl: row.action_url,
      actionLabel: row.action_label,
      readAt: row.read_at,
      createdAt: row.created_at,
    })),
    total: result.total,
  };
}

export async function markAsRead({ notificationId, userId }) {
  if (!notificationId || !userId) {
    throw new AppError('notificationId and userId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const marked = await repository.markAsRead({ notificationId, userId });

  if (!marked) {
    throw new AppError('Notification not found or already read', ERROR_CODES.NOT_FOUND, 404);
  }

  return { marked: true };
}

export async function markAllAsRead({ userId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const count = await repository.markAllAsRead({ userId });

  return { markedCount: count };
}

export async function countUnread({ userId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }
  const count = await repository.countUnread({ userId });
  return { unreadCount: count };
}

export async function deleteNotification({ notificationId, userId }) {
  if (!notificationId || !userId) {
    throw new AppError('notificationId and userId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const deleted = await repository.deleteNotification({ notificationId, userId });

  if (!deleted) {
    throw new AppError('Notification not found', ERROR_CODES.NOT_FOUND, 404);
  }

  return { deleted: true };
}

export async function processPendingNotifications({ limit = 100 }) {
  const pending = await repository.findPendingForScheduledDelivery({ limit });

  const results = [];

  for (const notification of pending) {
    try {
      const result = await dispatch({ notificationId: notification.id });
      results.push({ notificationId: notification.id, ...result });
    } catch (err) {
      logger.warn({ err, notificationId: notification.id }, 'Failed to dispatch pending notification');
      results.push({ notificationId: notification.id, dispatched: false, error: err.message });
    }
  }

  return { processed: results.length, results };
}

export const notificationService = {
  sendNotification,
  dispatch,
  retryFailed,
  sendBulkNotifications,
  listUserNotifications,
  markAsRead,
  markAllAsRead,
  countUnread,
  deleteNotification,
  processPendingNotifications,
  CHANNEL_RETRY_DELAYS_MS,
};