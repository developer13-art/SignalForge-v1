/**
 * Affiliate Link Repository
 *
 * @module signalforge/server/modules/affiliate/links/repository
 */

import { AffiliateRepository } from '../affiliate.repository.js';

export class AffiliateLinkRepository {
  constructor(db = null) {
    this.affiliateRepository = new AffiliateRepository(db);
  }

  async create(data) {
    return this.affiliateRepository.createLink(data);
  }

  async findById(linkId) {
    return this.affiliateRepository.findLinkById(linkId);
  }

  async findByCode(code) {
    return this.affiliateRepository.findLinkByCode(code);
  }

  async list(partnerId, filters, pagination) {
    return this.affiliateRepository.listLinks(partnerId, filters, pagination);
  }

  async update(linkId, data) {
    return this.affiliateRepository.updateLink(linkId, data);
  }

  async delete(linkId) {
    return this.affiliateRepository.deleteLink(linkId);
  }

  async incrementClick(linkId) {
    return this.affiliateRepository.incrementLinkClick(linkId);
  }

  async incrementConversion(linkId) {
    return this.affiliateRepository.incrementLinkConversion(linkId);
  }
}

export default AffiliateLinkRepository;