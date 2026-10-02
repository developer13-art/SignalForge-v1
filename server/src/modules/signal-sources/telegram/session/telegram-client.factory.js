/**
 * Telegram Client Factory
 *
 * Produces a Telegram client instance for a given session. The
 * concrete implementation (GramJS or MTProto) is injected so that
 * the module stays decoupled from the transport library.
 *
 * @module signalforge/server/modules/signal-sources/telegram/client-factory
 */
const { getLogger } = require('../../../bootstrap/initLogger.js');
const telegramConfig = require('../../../config/telegram.config.js');
const { SourceNotConfiguredError } = require('../../source.errors.js');

let clientConstructor = null;
class TelegramClientFactory {
  static register(factory) {
    if (typeof factory !== 'function') {
      throw new Error('Telegram client factory must be a function');
    }
    clientConstructor = factory;
  }

  static create(options = {}) {
    if (!clientConstructor) {
      throw new SourceNotConfiguredError('Telegram client factory has not been registered');
    }
    if (!telegramConfig.apiId || !telegramConfig.apiHash) {
      throw new SourceNotConfiguredError('Telegram API credentials are not configured');
    }

    const logger = getLogger('telegram-client');

    const client = clientConstructor({
      apiId: telegramConfig.apiId,
      apiHash: telegramConfig.apiHash,
      session: options.session || null,
      phoneNumber: options.phoneNumber || null,
      logger,
    });

    return client;
  }

  static isConfigured() {
    return Boolean(clientConstructor) && Boolean(telegramConfig.apiId) && Boolean(telegramConfig.apiHash);
  }
}
module.exports = TelegramClientFactory;
module.exports.TelegramClientFactory = TelegramClientFactory;
