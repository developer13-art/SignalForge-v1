/**
 * Push Notification Channel
 *
 * Delivers notifications via mobile push using FCM (or a similar
 * provider). A concrete provider can be registered at bootstrap.
 *
 * @module server/modules/notifications/channels/push.channel
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { config } from '../../../config';
import { db } from '../../../database';

let providerImpl = null;

export function registerPushProvider(provider) {
  if (!provider || typeof provider.send !== 'function') {
    throw new AppError('Push provider must implement send()', ERROR_CODES.INTERNAL_ERROR, 500);
  }
  providerImpl = provider;
}

async function listUserDevices({ userId }) {
  const { rows } = await db.query(
    `SELECT token, platform FROM user_devices WHERE user_id = $1 AND active = TRUE`,
    [userId],
  );
  return rows;
}

export const pushChannel = {
  name: 'PUSH',

  async isAvailable({ user }) {
    if (!user) {
      return false;
    }
    if (!config.push || !config.push.provider) {
      return false;
    }
    return providerImpl !== null;
  },

  async send({ notification, user }) {
    if (!providerImpl) {
      logger.warn({ userId: user.id }, 'Push provider not registered; marking as skipped');
      return { delivered: false, skipped: true, reason: 'PROVIDER_NOT_REGISTERED' };
    }

    const devices = await listUserDevices({ userId: user.id });

    if (devices.length === 0) {
      return { delivered: false, skipped: true, reason: 'NO_ACTIVE_DEVICES' };
    }

    const payload = {
      title: notification.title,
      body: notification.body || '',
      data: {
        notificationId: notification.id,
        type: notification.type,
        actionUrl: notification.action_url || null,
      },
    };

    const references = [];

    for (const device of devices) {
      try {
        const result = await providerImpl.send({
          token: device.token,
          platform: device.platform,
          ...payload,
        });
        references.push(result.messageId || null);
      } catch (err) {
        logger.warn({ err, userId: user.id, token: device.token }, 'Push delivery to device failed');
      }
    }

    return {
      delivered: references.length > 0,
      providerReference: references.filter(Boolean).join(',') || null,
    };
  },
};

export default pushChannel;