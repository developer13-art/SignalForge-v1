/**
 * Provider Revenue Repository
 *
 * @module signalforge/server/modules/providers/revenue/repository
 */
const { ProviderRepository } = require('../provider.repository.js');
class ProviderRevenueRepository {
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
module.exports = ProviderRevenueRepository;
module.exports.ProviderRevenueRepository = ProviderRevenueRepository;
