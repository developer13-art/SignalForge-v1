/**
 * Adapter Registry
 *
 * Resolves the correct adapter instance for a given source type.
 *
 * @module signalforge/server/modules/signal-sources/adapters/registry
 */
const { TelegramAdapter } = require('./telegram.adapter.js');
const { DiscordAdapter } = require('./discord.adapter.js');
const { WhatsAppAdapter } = require('./whatsapp.adapter.js');
const { TradingViewAdapter } = require('./tradingview.adapter.js');
const { EmailAdapter } = require('./email.adapter.js');
const { RestApiAdapter } = require('./rest-api.adapter.js');
const { SOURCE_TYPES } = require('../source.constants.js');
const { UnsupportedSourceTypeError } = require('../source.errors.js');

const registry = {
  [SOURCE_TYPES.TELEGRAM]: TelegramAdapter,
  [SOURCE_TYPES.DISCORD]: DiscordAdapter,
  [SOURCE_TYPES.WHATSAPP]: WhatsAppAdapter,
  [SOURCE_TYPES.TRADINGVIEW]: TradingViewAdapter,
  [SOURCE_TYPES.EMAIL]: EmailAdapter,
  [SOURCE_TYPES.REST_API]: RestApiAdapter,
};

export class AdapterRegistry {
  static register(sourceType, AdapterClass) {
    registry[sourceType] = AdapterClass;
  }

  static create(sourceType, config = {}) {
    const AdapterClass = registry[sourceType];
    if (!AdapterClass) {
      throw new UnsupportedSourceTypeError(undefined, { sourceType });
    }
    return new AdapterClass(config);
  }

  static supports(sourceType) {
    return Boolean(registry[sourceType]);
  }

  static list() {
    return Object.keys(registry);
  }
}
module.exports = AdapterRegistry;