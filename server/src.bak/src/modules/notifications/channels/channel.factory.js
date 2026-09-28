/**
 * Channel Factory
 *
 * Resolves notification channel implementations by name. Channels are
 * registered at bootstrap; unknown channels throw a clear error.
 *
 * @module server/modules/notifications/channels/channel.factory
 */
const { AppError } = require('../../../lib/errors/app-error');
const { ERROR_CODES } = require('../../../lib/errors/error-codes');
const { logger } = require('../../../lib/logger');
const { assertImplementsInterface, createNoopChannel } = require('./notification-channel.interface');
const { emailChannel } = require('./email.channel');
const { smsChannel } = require('./sms.channel');
const { pushChannel } = require('./push.channel');
const { inAppChannel } = require('./in-app.channel');
const { telegramChannel } = require('./telegram.channel');
const { discordChannel } = require('./discord.channel');
const { webhookChannel } = require('./webhook.channel');

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
function getChannel(channelName) {
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
function registerCustomChannel(channel) {
  registerChannel(channel);
}
function listRegisteredChannels() {
  return Array.from(REGISTERED_CHANNELS.keys());
}
function hasChannel(channelName) {
  if (!channelName) {
    return false;
  }
  return REGISTERED_CHANNELS.has(String(channelName).trim().toUpperCase());
}
const channelFactory = {
  getChannel,
  registerCustomChannel,
  listRegisteredChannels,
  hasChannel,
};
module.exports.channelFactory = channelFactory;
module.exports.getChannel = getChannel;
module.exports.registerCustomChannel = registerCustomChannel;
module.exports.listRegisteredChannels = listRegisteredChannels;
module.exports.hasChannel = hasChannel;
