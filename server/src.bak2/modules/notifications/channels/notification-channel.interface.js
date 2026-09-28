/**
 * Notification Channel Interface
 *
 * Defines the abstract interface every notification channel must
 * implement. Channels are resolved by the channel factory.
 *
 * @module server/modules/notifications/channels/notification-channel.interface
 */
const { AppError } = require('../../../lib/errors/app-error');
const { ERROR_CODES } = require('../../../lib/errors/error-codes');

const REQUIRED_METHODS = Object.freeze([
  'send',
  'isAvailable',
]);
function assertImplementsInterface(channel) {
  if (!channel || typeof channel !== 'object') {
    throw new AppError('Notification channel must be an object', ERROR_CODES.INTERNAL_ERROR, 500);
  }

  for (const method of REQUIRED_METHODS) {
    if (typeof channel[method] !== 'function') {
      throw new AppError(
        `Notification channel is missing required method: ${method}`,
        ERROR_CODES.INTERNAL_ERROR,
        500,
      );
    }
  }
}

/**
 * Create a no-op channel used as a fallback when a channel is not
 * registered.
 *
 * @param {string} channelName
 * @returns {object}
 */
function createNoopChannel(channelName) {
  return {
    name: channelName,
    async send() {
      throw new AppError(
        `Notification channel not implemented: ${channelName}`,
        ERROR_CODES.INTERNAL_ERROR,
        500,
      );
    },
    async isAvailable() {
      return false;
    },
  };
}
const NOTIFICATION_CHANNEL_REQUIRED_METHODS = REQUIRED_METHODS;
module.exports.NOTIFICATION_CHANNEL_REQUIRED_METHODS = NOTIFICATION_CHANNEL_REQUIRED_METHODS;
module.exports.assertImplementsInterface = assertImplementsInterface;
module.exports.createNoopChannel = createNoopChannel;
