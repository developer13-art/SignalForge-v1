/**
 * Adapter Registry
 *
 * Resolves the correct adapter instance for a given source type.
 *
 * @module signalforge/server/modules/signal-sources/adapters/registry
 */

import { TelegramAdapter } from './telegram.adapter.js';
import { DiscordAdapter } from './discord.adapter.js';
import { WhatsAppAdapter } from './whatsapp.adapter.js';
import { TradingViewAdapter } from './tradingview.adapter.js';
import { EmailAdapter } from './email.adapter.js';
import { RestApiAdapter } from './rest-api.adapter.js';
import { SOURCE_TYPES } from '../source.constants.js';
import { UnsupportedSourceTypeError } from '../source.errors.js';

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

export default AdapterRegistry;