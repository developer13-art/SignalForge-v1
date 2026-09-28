/**
 * In-App Notification Channel
 *
 * Persists notifications for in-app display. This channel is always
 * available and does not call any external service.
 *
 * @module server/modules/notifications/channels/in-app.channel
 */

import { logger } from '../../../lib/logger';

export const inAppChannel = {
  name: 'IN_APP',

  async isAvailable() {
    return true;
  },

  async send({ notification, user }) {
    logger.debug({ userId: user.id, notificationId: notification.id }, 'In-app notification stored');

    return {
      delivered: true,
      providerReference: `in-app:${notification.id}`,
    };
  },
};

export default inAppChannel;