/**
 * Review Repository
 *
 * @module signalforge/server/modules/marketplace/reviews/repository
 */

import { MarketplaceRepository } from '../marketplace.repository.js';

export class ReviewRepository {
  constructor(db = null) {
    this.marketplaceRepository = new MarketplaceRepository(db);
  }

  async create(data) {
    return this.marketplaceRepository.createReview(data);
  }

  async findById(reviewId) {
    return this.marketplaceRepository.findReviewById(reviewId);
  }

  async findByListingAndReviewer(listingId, reviewerId) {
    return this.marketplaceRepository.findReviewByListingAndReviewer(
      listingId,
      reviewerId,
    );
  }

  async list(listingId, filters, pagination) {
    return this.marketplaceRepository.listReviews(listingId, filters, pagination);
  }

  async update(reviewId, data) {
    return this.marketplaceRepository.updateReview(reviewId, data);
  }

  async delete(reviewId) {
    return this.marketplaceRepository.deleteReview(reviewId);
  }

  async countByStatus(listingId) {
    return this.marketplaceRepository.countReviewsByStatus(listingId);
  }

  async recomputeRating(listingId) {
    return this.marketplaceRepository.recomputeRating(listingId);
  }
}

export default ReviewRepository;