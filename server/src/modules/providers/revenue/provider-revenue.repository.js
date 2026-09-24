/**
 * Provider Revenue Repository
 *
 * @module signalforge/server/modules/providers/revenue/repository
 */

import { ProviderRepository } from '../provider.repository.js';

export class ProviderRevenueRepository {
  constructor(db = null) {
    this.providerRepository = new ProviderRepository(db);
  }

  async upsert(data) {
    return this.providerRepository.createRevenueRecord(data);
  }

  async list(providerId, filters, pagination) {
    return this.providerRepository.listRevenue(providerId, filters, pagination);
  }

  async sum(providerId, filters) {
    return this.providerRepository.sumRevenue(providerId, filters);
  }
}

export default ProviderRevenueRepository;