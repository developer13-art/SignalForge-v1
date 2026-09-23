/**
 * Broker Registry Service
 *
 * @module signalforge/server/modules/brokers/registry/broker-registry
 */

import { getLogger } from '../../../bootstrap/initLogger.js';
import { BROKER_PLATFORMS } from '../broker.constants.js';

const DEFAULT_BROKERS = Object.freeze({
  [BROKER_PLATFORMS.MT4]: [
    { name: 'Exness', server: 'Exness-MT4-Real' },
    { name: 'XM', server: 'XM-MT4-Real' },
    { name: 'IC Markets', server: 'ICMarkets-MT4-Live' },
    { name: 'FXTM', server: 'FXTM-MT4-Real' },
    { name: 'HotForex', server: 'HFMarkets-MT4-Live' },
    { name: 'OctaFX', server: 'OctaFX-MT4-Real' },
    { name: 'FBS', server: 'FBS-MT4-Real' },
  ],
  [BROKER_PLATFORMS.MT5]: [
    { name: 'Exness', server: 'Exness-MT5-Real' },
    { name: 'XM', server: 'XM-MT5-Real' },
    { name: 'IC Markets', server: 'ICMarkets-MT5-Live' },
    { name: 'FXTM', server: 'FXTM-MT5-Real' },
    { name: 'HotForex', server: 'HFMarkets-MT5-Live' },
    { name: 'OctaFX', server: 'OctaFX-MT5-Real' },
    { name: 'FBS', server: 'FBS-MT5-Real' },
    { name: 'Pepperstone', server: 'Pepperstone-MT5-Live' },
  ],
});

export class BrokerRegistryService {
  constructor(repository = null) {
    this.repository = repository;
    this.logger = getLogger('broker-registry');
    this.cache = new Map();
  }

  async listBrokers(filters = {}) {
    if (!this.repository) {
      return this.listDefaults(filters);
    }
    return this.repository.listBrokers(filters);
  }

  listDefaults(filters = {}) {
    if (filters.platform && DEFAULT_BROKERS[filters.platform]) {
      return DEFAULT_BROKERS[filters.platform];
    }
    const all = [];
    for (const [platform, brokers] of Object.entries(DEFAULT_BROKERS)) {
      for (const broker of brokers) {
        all.push({ ...broker, platform });
      }
    }
    return all;
  }

  getSupportedPlatforms() {
    return Object.keys(DEFAULT_BROKERS);
  }

  async getOrCreateDefaultBroker(name, platform, server) {
    if (!this.repository) {
      return null;
    }

    const cacheKey = `${name}:${server}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    let broker = await this.repository.findBrokerByNameAndServer(name, server);
    if (!broker) {
      broker = await this.repository.createBroker({
        name,
        platform,
        server,
        isActive: true,
      });
    }

    this.cache.set(cacheKey, broker);
    return broker;
  }

  clearCache() {
    this.cache.clear();
  }
}

export default BrokerRegistryService;