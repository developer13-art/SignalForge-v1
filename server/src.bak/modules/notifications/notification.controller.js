/**
 * Notification Controller
 *
 * HTTP handlers for notification operations including listing,
 * reading, marking as read, deleting, and fetching preferences.
 *
 * @module server/modules/notifications/notification.controller
 */

import { AppError } from '../../lib/errors/app-error';
import { ERROR_CODES } from '../../lib/errors/error-codes';
import { logger } from '../../lib/logger';
import { successResponse } from '../../lib/response/success.response';
import { paginatedResponse } from '../../lib/response/paginated.response';
import { notificationService } from './notification.service';
import { preferenceService } from './preferences/preference.service';

export async function listNotifications(req, res) {
  const userId = req.user && req.user.id;
  const { page, limit, status, category, unreadOnly, from, to } = req.query;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const result = await notificationService.listUserNotifications({
    userId,
    filters: {
      status,
      category,
      unreadOnly: unreadOnly === 'true' || unreadOnly === true,
      from,
      to,
    },
    pagination: { page, limit },
  });

  return paginatedResponse(res, {
    items: result.items,
    meta: {
      total: result.total,
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    },
  });
}

export async function getUnreadCount(req, res) {
  const userId = req.user && req.user.id;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const result = await notificationService.countUnread({ userId });

  return successResponse(res, result);
}

export async function markAsRead(req, res) {
  const userId = req.user && req.user.id;
  const { notificationId } = req.params;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const result = await notificationService.markAsRead({ notificationId, userId });

  return successResponse(res, result);
}

export async function markAllAsRead(req, res) {
  const userId = req.user && req.user.id;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const result = await notificationService.markAllAsRead({ userId });

  return successResponse(res, result);
}

export async function deleteNotification(req, res) {
  const userId = req.user && req.user.id;
  const { notificationId } = req.params;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const result = await notificationService.deleteNotification({ notificationId, userId });

  return successResponse(res, result);
}

export async function getPreferences(req, res) {
  const userId = req.user && req.user.id;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const preferences = await preferenceService.getPreferences({ userId });

  return successResponse(res, { preferences });
}

export async function updatePreferences(req, res) {
  const userId = req.user && req.user.id;
  const payload = req.body || {};

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const preferences = await preferenceService.updatePreferences({ userId, payload });

  logger.info({ userId }, 'Notification preferences updated');

  return successResponse(res, { preferences });
}

export const notificationController = {
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getPreferences,
  updatePreferences,
};