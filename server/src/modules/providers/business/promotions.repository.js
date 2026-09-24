/**
 * Provider Promotions Repository
 *
 * @module signalforge/server/modules/providers/business/promotions-repository
 */

import { ProviderRepository } from '../provider.repository.js';

export class ProviderPromotionsRepository {
  constructor(db = null) {
    this.providerRepository = new ProviderRepository(db);
  }

  async create(data) {
    return this.providerRepository.createPromotion(data);
  }

  async findById(promotionId) {
    return this.providerRepository.findPromotionById(promotionId);
  }

  async list(providerId, filters, pagination) {
    return this.providerRepository.listPromotions(providerId, filters, pagination);
  }

  async update(promotionId, data) {
    return this.providerRepository.updatePromotion(promotionId, data);
  }

  async delete(promotionId) {
    return this.providerRepository.deletePromotion(promotionId);
  }
}

export default ProviderPromotionsRepository;