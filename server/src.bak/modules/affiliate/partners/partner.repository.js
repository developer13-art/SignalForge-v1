/**
 * Affiliate Partner Repository
 *
 * @module signalforge/server/modules/affiliate/partners/repository
 */

import { AffiliateRepository } from '../affiliate.repository.js';

export class AffiliatePartnerRepository {
  constructor(db = null) {
    this.affiliateRepository = new AffiliateRepository(db);
  }

  async create(data) {
    return this.affiliateRepository.createPartner(data);
  }

  async findById(partnerId) {
    return this.affiliateRepository.findPartnerById(partnerId);
  }

  async findByUserId(userId) {
    return this.affiliateRepository.findPartnerByUserId(userId);
  }

  async findBySlug(slug) {
    return this.affiliateRepository.findPartnerBySlug(slug);
  }

  async list(filters, pagination) {
    return this.affiliateRepository.listPartners(filters, pagination);
  }

  async update(partnerId, data) {
    return this.affiliateRepository.updatePartner(partnerId, data);
  }

  async delete(partnerId) {
    return this.affiliateRepository.deletePartner(partnerId);
  }

  async recomputeCounters(partnerId) {
    return this.affiliateRepository.recomputePartnerCounters(partnerId);
  }
}

export default AffiliatePartnerRepository;