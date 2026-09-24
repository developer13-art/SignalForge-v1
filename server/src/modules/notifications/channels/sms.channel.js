/**
 * SMS Notification Channel
 *
 * Delivers notifications via SMS using a configurable provider.
 * The default implementation is a no-op when no SMS provider is
 * configured; a concrete provider can be swapped in at bootstrap.
 *
 * @module server/modules/notifications/channels/sms.channel
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { config } from '../../../config';

let providerImpl = null;

export function registerSmsProvider(provider) {
  if (!provider || typeof provider.send !== 'function') {
    throw new AppError('SMS provider must implement send()', ERROR_CODES.INTERNAL_ERROR, 500);
  }
  providerImpl = provider;
}

export const smsChannel = {
  name: 'SMS',

  async isAvailable({ user }) {
    if (!user || !user.phone) {
      return false;
    }
    if (!config.sms || !config.sms.provider) {
      return false;
    }
    return providerImpl !== null;
  },

  async send({ notification, user }) {
    if (!user || !user.phone) {
      throw new AppError('User phone is required for SMS channel', ERROR_CODES.NOTIFICATION_CHANNEL_UNAVAILABLE, 400);
    }

    if (!providerImpl) {
      logger.warn({ userId: user.id }, 'SMS provider not registered; marking as skipped');
      return { delivered: false, skipped: true, reason: 'PROVIDER_NOT_REGISTERED' };
    }

    const text = `${notification.title}${notification.body ? ` - ${notification.body}` : ''}`.substring(0, 320);

    const result = await providerImpl.send({
      to: user.phone,
      text,
    });

    return {
      delivered: true,
      providerReference: result.messageId || null,
    };
  },
};

export default smsChannel;