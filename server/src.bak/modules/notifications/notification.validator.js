/**
 * Notification Validator
 *
 * Validation for notification payloads, channel selection, and
 * preference updates.
 *
 * @module server/modules/notifications/notification.validator
 */

import { AppError } from '../../lib/errors/app-error';
import { ERROR_CODES } from '../../lib/errors/error-codes';
import {
  NOTIFICATION_TYPE_VALUES,
  NOTIFICATION_PRIORITY_VALUES,
  NOTIFICATION_CATEGORY_VALUES,
} from '@signalforge/shared/constants/notification-types';
import { NOTIFICATION_CHANNEL_VALUES } from '@signalforge/shared/constants/notification-channels';

const MAX_TITLE_LENGTH = 256;
const MAX_BODY_LENGTH = 4096;
const MAX_ACTION_URL_LENGTH = 1024;
const MAX_TEMPLATE_DATA_KEYS = 100;

export function validateNotificationPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new AppError('Payload must be an object', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!payload.userId || typeof payload.userId !== 'string') {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!payload.type || typeof payload.type !== 'string') {
    throw new AppError('type is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!NOTIFICATION_TYPE_VALUES.includes(payload.type)) {
    throw new AppError(`Invalid notification type: ${payload.type}`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!payload.title || typeof payload.title !== 'string') {
    throw new AppError('title is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const title = payload.title.trim();

  if (title.length === 0 || title.length > MAX_TITLE_LENGTH) {
    throw new AppError(`title must be between 1 and ${MAX_TITLE_LENGTH} characters`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  let body = null;
  if (payload.body !== undefined && payload.body !== null) {
    if (typeof payload.body !== 'string') {
      throw new AppError('body must be a string', ERROR_CODES.VALIDATION_FAILED, 400);
    }
    if (payload.body.length > MAX_BODY_LENGTH) {
      throw new AppError(`body exceeds ${MAX_BODY_LENGTH} characters`, ERROR_CODES.VALIDATION_FAILED, 400);
    }
    body = payload.body;
  }

  const priority = payload.priority || 'NORMAL';
  if (!NOTIFICATION_PRIORITY_VALUES.includes(priority)) {
    throw new AppError(`Invalid priority: ${priority}`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  let category = null;
  if (payload.category !== undefined && payload.category !== null) {
    if (!NOTIFICATION_CATEGORY_VALUES.includes(payload.category)) {
      throw new AppError(`Invalid category: ${payload.category}`, ERROR_CODES.VALIDATION_FAILED, 400);
    }
    category = payload.category;
  }

  const channels = payload.channels;

  if (!Array.isArray(channels) || channels.length === 0) {
    throw new AppError('channels must be a non-empty array', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const invalidChannel = channels.find((c) => !NOTIFICATION_CHANNEL_VALUES.includes(c));
  if (invalidChannel) {
    throw new AppError(`Invalid channel: ${invalidChannel}`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  let templateData = null;
  if (payload.templateData !== undefined && payload.templateData !== null) {
    if (typeof payload.templateData !== 'object') {
      throw new AppError('templateData must be an object', ERROR_CODES.VALIDATION_FAILED, 400);
    }
    const keyCount = Object.keys(payload.templateData).length;
    if (keyCount > MAX_TEMPLATE_DATA_KEYS) {
      throw new AppError(`templateData exceeds ${MAX_TEMPLATE_DATA_KEYS} keys`, ERROR_CODES.VALIDATION_FAILED, 400);
    }
    templateData = payload.templateData;
  }

  let actionUrl = null;
  if (payload.actionUrl !== undefined && payload.actionUrl !== null) {
    if (typeof payload.actionUrl !== 'string' || payload.actionUrl.length > MAX_ACTION_URL_LENGTH) {
      throw new AppError('actionUrl is invalid', ERROR_CODES.VALIDATION_FAILED, 400);
    }
    actionUrl = payload.actionUrl.trim();
  }

  return {
    userId: payload.userId,
    type: payload.type,
    category: category,
    priority,
    title,
    body,
    channels: Array.from(new Set(channels)),
    templateKey: payload.templateKey || null,
    templateData,
    actionUrl,
    actionLabel: payload.actionLabel ? String(payload.actionLabel).substring(0, 64) : null,
    referenceType: payload.referenceType ? String(payload.referenceType).substring(0, 64) : null,
    referenceId: payload.referenceId ? String(payload.referenceId).substring(0, 128) : null,
    expiresAt: payload.expiresAt || null,
    scheduledFor: payload.scheduledFor || null,
    metadata: payload.metadata || null,
  };
}

export function validateChannelSelection(channels) {
  if (!Array.isArray(channels) || channels.length === 0) {
    throw new AppError('channels must be a non-empty array', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const invalid = channels.find((c) => !NOTIFICATION_CHANNEL_VALUES.includes(c));

  if (invalid) {
    throw new AppError(`Invalid channel: ${invalid}`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  return Array.from(new Set(channels));
}

export function validatePreferenceUpdate(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new AppError('Payload must be an object', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const result = {};

  if (payload.channels !== undefined) {
    result.channels = validateChannelSelection(payload.channels);
  }

  if (payload.mutedCategories !== undefined) {
    if (!Array.isArray(payload.mutedCategories)) {
      throw new AppError('mutedCategories must be an array', ERROR_CODES.VALIDATION_FAILED, 400);
    }
    const invalid = payload.mutedCategories.find((c) => !NOTIFICATION_CATEGORY_VALUES.includes(c));
    if (invalid) {
      throw new AppError(`Invalid muted category: ${invalid}`, ERROR_CODES.VALIDATION_FAILED, 400);
    }
    result.mutedCategories = Array.from(new Set(payload.mutedCategories));
  }

  if (payload.quietHoursStart !== undefined) {
    result.quietHoursStart = validateTimeString(payload.quietHoursStart, 'quietHoursStart');
  }

  if (payload.quietHoursEnd !== undefined) {
    result.quietHoursEnd = validateTimeString(payload.quietHoursEnd, 'quietHoursEnd');
  }

  if (payload.timezone !== undefined) {
    if (typeof payload.timezone !== 'string' || payload.timezone.length > 64) {
      throw new AppError('timezone is invalid', ERROR_CODES.VALIDATION_FAILED, 400);
    }
    result.timezone = payload.timezone.trim();
  }

  return result;
}

function validateTimeString(value, fieldName) {
  if (value === null) {
    return null;
  }
  if (typeof value !== 'string' || !/^\d{2}:\d{2}$/.test(value)) {
    throw new AppError(`${fieldName} must be in HH:MM format`, ERROR_CODES.VALIDATION_FAILED, 400);
  }
  const [h, m] = value.split(':').map(Number);
  if (h < 0 || h > 23 || m < 0 || m > 59) {
    throw new AppError(`${fieldName} is not a valid time`, ERROR_CODES.VALIDATION_FAILED, 400);
  }
  return value;
}

export const NOTIFICATION_VALIDATION_CONSTRAINTS = Object.freeze({
  maxTitleLength: MAX_TITLE_LENGTH,
  maxBodyLength: MAX_BODY_LENGTH,
  maxActionUrlLength: MAX_ACTION_URL_LENGTH,
  maxTemplateDataKeys: MAX_TEMPLATE_DATA_KEYS,
});