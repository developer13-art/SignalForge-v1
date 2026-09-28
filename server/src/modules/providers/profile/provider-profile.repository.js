/**
 * Provider Profile Repository
 *
 * @module signalforge/server/modules/providers/profile/repository
 */
const { ProviderRepository } = require('../provider.repository.js');
class ProviderProfileRepository {
  constructor(db = null) {
    this.providerRepository = new ProviderRepository(db);
  }

  async findById(providerId) {
    return this.providerRepository.findById(providerId);
  }

  async findByUserId(userId) {
    return this.providerRepository.findByUserId(userId);
  }

  async findBySlug(slug) {
    return this.providerRepository.findBySlug(slug);
  }

  async list(filters, pagination) {
    return this.providerRepository.list(filters, pagination);
  }

  async update(providerId, data) {
    return this.providerRepository.update(providerId, data);
  }
}
module.exports = ProviderProfileRepository;
module.exports.ProviderProfileRepository = ProviderProfileRepository;
