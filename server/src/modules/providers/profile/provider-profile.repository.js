/**
 * Provider Profile Repository
 *
 * @module signalforge/server/modules/providers/profile/repository
 */

import { ProviderRepository } from '../provider.repository.js';

export class ProviderProfileRepository {
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

export default ProviderProfileRepository;