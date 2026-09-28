/**
 * Channel Factory
 *
 * Resolves notification channel implementations by name. Channels are
 * registered at bootstrap; unknown channels throw a clear error.
 *
 * @module server/modules/notifications/channels/channel.factory
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { assertImplementsInterface, createNoopChannel } from './notification-channel.interface';
import { emailChannel } from './email.channel';
import { smsChannel } from './sms.channel';
import { pushChannel } from './push.channel';
import { inAppChannel } from './in-app.channel';
import { telegramChannel } from './telegram.channel';
import { discordChannel } from './discord.channel';
import { webhookChannel } from './webhook.channel';

const REGISTERED_CHANNELS = new Map();

function registerChannel(channel) {
  assertImplementsInterface(channel);
  REGISTERED_CHANNELS.set(channel.name, channel);
}

registerChannel(emailChannel);
registerChannel(smsChannel);
registerChannel(pushChannel);
registerChannel(inAppChannel);
registerChannel(telegramChannel);
registerChannel(discordChannel);
registerChannel(webhookChannel);

export function getChannel(channelName) {
  if (!channelName) {
    throw new AppError('channelName is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const upper = String(channelName).trim().toUpperCase();

  const channel = REGISTERED_CHANNELS.get(upper);

  if (!channel) {
    logger.warn({ channelName: upper }, 'Unknown notification channel requested');
    return createNoopChannel(upper);
  }

  return channel;
}

export function registerCustomChannel(channel) {
  registerChannel(channel);
}

export function listRegisteredChannels() {
  return Array.from(REGISTERED_CHANNELS.keys());
}

export function hasChannel(channelName) {
  if (!channelName) {
    return false;
  }
  return REGISTERED_CHANNELS.has(String(channelName).trim().toUpperCase());
}

export const channelFactory = {
  getChannel,
  registerCustomChannel,
  listRegisteredChannels,
  hasChannel,
};