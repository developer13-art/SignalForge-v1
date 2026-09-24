/**
 * Marketplace Service (facade)
 *
 * @module signalforge/server/modules/marketplace/service
 */

import { MarketplaceRepository } from './marketplace.repository.js';
import { ListingService } from './listings/service.js';
import { ReviewService } from './reviews/service.js';
import { CategoryService } from './discovery/category.js';
import { SearchService } from './discovery/search.js';
import { FeaturedService } from './discovery/featured.js';
import { RecommendationService } from './discovery/recommendation.js';
import { RankingService } from './discovery/ranking.js';
import { ComparisonService } from './comparison/comparison.service.js';
import { ProviderConsensusService } from './comparison/provider-consensus.service.js';

export class MarketplaceService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new MarketplaceRepository();

    this.listings =
      dependencies.listings || new ListingService(dependencies.listingRepository);
    this.reviews =
      dependencies.reviews || new ReviewService(dependencies.reviewRepository);
    this.categories =
      dependencies.categories || new CategoryService(this.repository);
    this.ranking = dependencies.ranking || new RankingService();
    this.search = dependencies.search || new SearchService(null, this.ranking);
    this.featured = dependencies.featured || new FeaturedService(null, this.ranking);
    this.recommendations =
      dependencies.recommendations || new RecommendationService();
    this.comparison = dependencies.comparison || new ComparisonService();
    this.consensus = dependencies.consensus || new ProviderConsensusService();
  }

  async createListing(providerId, userId, payload) {
    return this.listings.createForProvider(providerId, userId, payload);
  }

  async getListing(listingId) {
    return this.listings.getById(listingId);
  }

  async getListingBySlug(slug) {
    return this.listings.getBySlug(slug);
  }

  async listListings(filters, pagination) {
    return this.listings.listPublished(filters, pagination);
  }

  async listFeatured(limit) {
    return this.featured.getFeatured(limit);
  }

  async listTrending(limit) {
    return this.featured.getTrending(limit);
  }

  async updateListing(userId, listingId, payload) {
    return this.listings.update(userId, listingId, payload);
  }

  async publishListing(userId, listingId) {
    return this.listings.publish(userId, listingId);
  }

  async unpublishListing(userId, listingId) {
    return this.listings.unpublish(userId, listingId);
  }

  async deleteListing(userId, listingId) {
    return this.listings.remove(userId, listingId);
  }

  async searchListings(filters, userId) {
    return this.search.search(filters, userId);
  }

  async getRecommendations(userId, limit, strategy) {
    return this.recommendations.getRecommendations(userId, limit, strategy);
  }

  async addReview(listingId, reviewerId, payload) {
    return this.reviews.addReview(listingId, reviewerId, payload);
  }

  async listReviews(listingId, filters, pagination) {
    return this.reviews.listReviews(listingId, filters, pagination);
  }

  async updateReview(reviewerId, reviewId, payload) {
    return this.reviews.updateReview(reviewerId, reviewId, payload);
  }

  async deleteReview(reviewerId, reviewId) {
    return this.reviews.deleteReview(reviewerId, reviewId);
  }

  async replyToReview(userId, reviewId, reply) {
    return this.reviews.replyToReview(userId, reviewId, reply);
  }

  async moderateReview(reviewId, actorId, status, reason) {
    return this.reviews.moderation.moderate(reviewId, actorId, status, reason);
  }

  async listCategories(filters) {
    return this.categories.listCategories(filters);
  }

  async getCategoryByCode(code) {
    return this.categories.getByCode(code);
  }

  async createCategory(payload) {
    return this.categories.create(payload);
  }

  async updateCategory(categoryId, payload) {
    return this.categories.update(categoryId, payload);
  }

  async deleteCategory(categoryId) {
    return this.categories.delete(categoryId);
  }

  async getCategoryCounts() {
    return this.categories.getCategoryCounts();
  }

  async compareProviders(providerIds) {
    return this.comparison.compare(providerIds);
  }

  async computeConsensus(providerIds, windowHours) {
    return this.consensus.computeConsensus(providerIds, windowHours);
  }
}

export default MarketplaceService;