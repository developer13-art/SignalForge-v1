/**
 * Notifications API
 *
 * @module client/src/api/notification.api
 */

import { get, patch, del } from './client.js';
import { endpoints } from './endpoints.js';

export const notificationApi = {
  list: (params) => get(endpoints.notifications.list, { params }),

  getUnreadCount: () => get(endpoints.notifications.unreadCount),

  markAsRead: (notificationId) => patch(endpoints.notifications.markRead(notificationId)),

  markAllAsRead: () => patch(endpoints.notifications.markAllRead),

  remove: (notificationId) => del(endpoints.notifications.delete(notificationId)),

  getPreferences: () => get(endpoints.notifications.preferences),

  updatePreferences: (payload) => patch(endpoints.notifications.preferences, payload),
};

export default notificationApi;