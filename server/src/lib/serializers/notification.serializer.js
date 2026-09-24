/**
 * Notification Serializer
 *
 * @module server/lib/serializers/notification.serializer
 */

export function serializeNotification(notification) {
  if (!notification) {
    return null;
  }

  return {
    notificationId: notification.id,
    userId: notification.user_id,
    type: notification.type,
    category: notification.category,
    priority: notification.priority,
    title: notification.title,
    body: notification.body,
    status: notification.status,
    actionUrl: notification.action_url,
    actionLabel: notification.action_label,
    readAt: notification.read_at,
    createdAt: notification.created_at,
  };
}

export default serializeNotification;