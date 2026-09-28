/**
 * Notification Controller
 *
 * HTTP handlers for notification operations including listing,
 * reading, marking as read, deleting, and fetching preferences.
 *
 * @module server/modules/notifications/notification.controller
 */
const { AppError } = require('../../lib/errors/app-error');
const { ERROR_CODES } = require('../../lib/errors/error-codes');
const { logger } = require('../../lib/logger');
const { successResponse } = require('../../lib/response/success.response');
const { paginatedResponse } = require('../../lib/response/paginated.response');
const { notificationService } = require('./notification.service');
const { preferenceService } = require('./preferences/preference.service');

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
const notificationController = {
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getPreferences,
  updatePreferences,
};
module.exports.notificationController = notificationController;
