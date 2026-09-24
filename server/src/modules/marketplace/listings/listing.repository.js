/**
 * Listing Repository
 *
 * @module signalforge/server/modules/marketplace/listings/repository
 */

import { MarketplaceRepository } from '../marketplace.repository.js';

export class ListingRepository {
  constructor(db = null) {
    this.marketplaceRepository = new MarketplaceRepository(db);
  }

  async create(data) {
    return this.marketplaceRepository.createListing(data);
  }

  async findById(listingId) {
    return this.marketplaceRepository.findListingById(listingId);
  }

  async findByProviderId(providerId) {
    return this.marketplaceRepository.findListingByProviderId(providerId);
  }

  async findBySlug(slug) {
    return this.marketplaceRepository.findListingBySlug(slug);
  }

  async list(filters, pagination) {
    return this.marketplaceRepository.listListings(filters, pagination);
  }

  async update(listingId, data) {
    return this.marketplaceRepository.updateListing(listingId, data);
  }

  async delete(listingId) {
    return this.marketplaceRepository.deleteListing(listingId);
  }

  async incrementViewCount(listingId) {
    return this.marketplaceRepository.incrementViewCount(listingId);
  }

  async recomputeRating(listingId) {
    return this.marketplaceRepository.recomputeRating(listingId);
  }

  async listFeatured(limit) {
    return this.marketplaceRepository.listFeaturedListings(limit);
  }
}

export default ListingRepository;