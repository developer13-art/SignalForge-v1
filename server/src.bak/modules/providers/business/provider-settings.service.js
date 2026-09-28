/**
 * Provider Settings Service
 *
 * @module signalforge/server/modules/providers/business/provider-settings
 */

import { ProviderRepository } from '../provider.repository.js';
import { ProviderNotFoundError } from '../provider.errors.js';
import { emitProviderUpdated } from '../provider.events.js';

const DEFAULT_SETTINGS = Object.freeze({
  allowCopyTrading: true,
  allowPartialCopy: true,
  minCopyVolume: 0.01,
  maxCopyVolume: 100,
  requireCertification: false,
  allowPublicDiscovery: true,
  enablePromotions: true,
  preferredLanguage: 'en',
  timezone: 'UTC',
});

export class ProviderSettingsService {
  constructor(repository = null) {
    this.repository = repository || new ProviderRepository();
  }

  async getSettings(providerId) {
    const provider = await this.repository.findById(providerId);
    if (!provider) {
      throw new ProviderNotFoundError();
    }
    const metadata = this.parseJson(provider.metadata) || {};
    return { ...DEFAULT_SETTINGS, ...(metadata.settings || {}) };
  }

  async updateSettings(providerId, payload) {
    const provider = await this.repository.findById(providerId);
    if (!provider) {
      throw new ProviderNotFoundError();
    }

    const metadata = this.parseJson(provider.metadata) || {};
    metadata.settings = { ...(metadata.settings || {}), ...payload };

    await this.repository.update(providerId, { metadata });
    await emitProviderUpdated(providerId, ['settings']);

    return { ...DEFAULT_SETTINGS, ...metadata.settings };
  }

  parseJson(input) {
    if (!input) {
      return null;
    }
    if (typeof input === 'string') {
      try {
        return JSON.parse(input);
      } catch {
        return null;
      }
    }
    return input;
  }
}

export { DEFAULT_SETTINGS };

export default ProviderSettingsService;