/**
 * Notification Payload Schema
 *
 * Defines the structure of a notification payload processed by the
 * Notification Service.
 *
 * @module @signalforge/shared/schemas/notification-payload
 */

import { NOTIFICATION_TYPE_VALUES } from '../constants/notification-types.js';
import { NOTIFICATION_CHANNEL_VALUES } from '../constants/notification-channels.js';
import { NOTIFICATION_PRIORITY_VALUES } from '../constants/notification-types.js';

export const NOTIFICATION_PAYLOAD_SCHEMA = Object.freeze({
  type: 'object',
  required: ['notificationId', 'userId', 'type', 'priority', 'title', 'channels'],
  properties: {
    notificationId: { type: 'string', format: 'uuid' },
    userId: { type: 'string', format: 'uuid' },
    type: { type: 'string', enum: NOTIFICATION_TYPE_VALUES },
    category: { type: 'string', nullable: true, maxLength: 64 },
    priority: { type: 'string', enum: NOTIFICATION_PRIORITY_VALUES, default: 'NORMAL' },
    title: { type: 'string', minLength: 1, maxLength: 256 },
    body: { type: 'string', nullable: true, maxLength: 4096 },
    channels: {
      type: 'array',
      items: { type: 'string', enum: NOTIFICATION_CHANNEL_VALUES },
      minItems: 1,
    },
    templateKey: { type: 'string', nullable: true, maxLength: 128 },
    templateData: { type: 'object', nullable: true },
    actionUrl: { type: 'string', nullable: true, maxLength: 1024 },
    actionLabel: { type: 'string', nullable: true, maxLength: 64 },
    referenceType: { type: 'string', nullable: true, maxLength: 64 },
    referenceId: { type: 'string', nullable: true, maxLength: 128 },
    expiresAt: { type: 'string', format: 'date-time', nullable: true },
    scheduledFor: { type: 'string', format: 'date-time', nullable: true },
    metadata: { type: 'object', nullable: true },
  },
  additionalProperties: false,
});

export function buildNotificationPayload(input) {
  return {
    notificationId: input.notificationId,
    userId: input.userId,
    type: input.type,
    category: input.category || null,
    priority: input.priority || 'NORMAL',
    title: input.title,
    body: input.body || null,
    channels: input.channels,
    templateKey: input.templateKey || null,
    templateData: input.templateData || null,
    actionUrl: input.actionUrl || null,
    actionLabel: input.actionLabel || null,
    referenceType: input.referenceType || null,
    referenceId: input.referenceId || null,
    expiresAt: input.expiresAt || null,
    scheduledFor: input.scheduledFor || null,
    metadata: input.metadata || null,
  };
}

export function validateNotificationPayload(payload) {
  const errors = [];

  if (!payload || typeof payload !== 'object') {
    return { valid: false, errors: ['Notification payload must be an object'] };
  }

  for (const field of NOTIFICATION_PAYLOAD_SCHEMA.required) {
    if (payload[field] === undefined || payload[field] === null) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (payload.type && !NOTIFICATION_TYPE_VALUES.includes(payload.type)) {
    errors.push(`Invalid notification type: ${payload.type}`);
  }

  if (!Array.isArray(payload.channels) || payload.channels.length === 0) {
    errors.push('Channels must be a non-empty array');
  } else {
    for (const channel of payload.channels) {
      if (!NOTIFICATION_CHANNEL_VALUES.includes(channel)) {
        errors.push(`Invalid channel: ${channel}`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export const NOTIFICATION_PAYLOAD_FIELDS = Object.freeze(
  Object.keys(NOTIFICATION_PAYLOAD_SCHEMA.properties),
);