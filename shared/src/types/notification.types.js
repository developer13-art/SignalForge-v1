/**
 * Notification Type Definitions
 *
 * Provides JSDoc typedefs for notification objects.
 *
 * @module @signalforge/shared/types/notification
 */

/**
 * @typedef {Object} Notification
 * @property {string} notificationId
 * @property {string} userId
 * @property {string} type
 * @property {string} category
 * @property {string} priority
 * @property {string} title
 * @property {string|null} body
 * @property {Array<string>} channels
 * @property {string} status
 * @property {string|null} actionUrl
 * @property {string|null} actionLabel
 * @property {string|null} referenceType
 * @property {string|null} referenceId
 * @property {string|null} readAt
 * @property {string|null} sentAt
 * @property {string|null} failedAt
 * @property {string|null} failureReason
 * @property {string|null} expiresAt
 * @property {string|null} scheduledFor
 * @property {string} createdAt
 * @property {Object|null} metadata
 */

/**
 * @typedef {Object} NotificationTemplate
 * @property {string} templateId
 * @property {string} key
 * @property {string} channel
 * @property {string} subject
 * @property {string} bodyTemplate
 * @property {Array<string>} requiredVariables
 * @property {boolean} enabled
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} NotificationPreference
 * @property {string} preferenceId
 * @property {string} userId
 * @property {string} notificationType
 * @property {boolean} inApp
 * @property {boolean} email
 * @property {boolean} sms
 * @property {boolean} push
 * @property {boolean} telegram
 * @property {boolean} discord
 * @property {boolean} webhook
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} NotificationDelivery
 * @property {string} deliveryId
 * @property {string} notificationId
 * @property {string} channel
 * @property {string} status
 * @property {string|null} providerMessageId
 * @property {number} attemptCount
 * @property {string|null} lastAttemptAt
 * @property {string|null} deliveredAt
 * @property {string|null} failureReason
 * @property {string} createdAt
 */

/**
 * @typedef {Object} WebhookSubscription
 * @property {string} subscriptionId
 * @property {string} userId
 * @property {string} url
 * @property {string} secret
 * @property {Array<string>} events
 * @property {boolean} enabled
 * @property {string|null} lastDeliveryAt
 * @property {string|null} lastDeliveryStatus
 * @property {string} createdAt
 * @property {string} updatedAt
 */

export const NOTIFICATION_TYPES = Object.freeze({
  Notification: 'Notification',
  NotificationTemplate: 'NotificationTemplate',
  NotificationPreference: 'NotificationPreference',
  NotificationDelivery: 'NotificationDelivery',
  WebhookSubscription: 'WebhookSubscription',
});