/**
 * Provider Subscriber Repository
 *
 * @module signalforge/server/modules/providers/subscribers/repository
 */
const { ProviderRepository } = require('../provider.repository.js');
class ProviderSubscriberRepository {
  constructor(db = null) {
    this.providerRepository = new ProviderRepository(db);
  }

  async create(data) {
    return this.providerRepository.createSubscriber(data);
  }

  async find(providerId, subscriberId) {
    return this.providerRepository.findSubscriber(providerId, subscriberId);
  }

  async list(providerId, filters, pagination) {
    return this.providerRepository.listSubscribers(providerId, filters, pagination);
  }

  async update(subscriberId, data) {
    return this.providerRepository.updateSubscriber(subscriberId, data);
  }

  async incrementProviderCount(providerId) {
    return this.providerRepository.incrementSubscriberCount(providerId);
  }

  async decrementProviderCount(providerId) {
    return this.providerRepository.decrementSubscriberCount(providerId);
  }
}
module.exports = ProviderSubscriberRepository;
module.exports.ProviderSubscriberRepository = ProviderSubscriberRepository;
