/**
 * Marketplace Controller
 *
 * @module signalforge/server/modules/marketplace/controller
 */

import { MarketplaceService } from './service.js';
import { ListingController } from './listings/listing.controller.js';
import { ReviewController } from './reviews/review.controller.js';
import { validateCategoryPayload, validateSearchPayload } from './marketplace.validator.js';
import { ValidationError } from '../../lib/errors/validation-error.js';

export class MarketplaceController {
  constructor(service = null) {
    this.service = service || new MarketplaceService();
    this.listingController = new ListingController(this.service.listings);
    this.reviewController = new ReviewController(this.service.reviews);
  }

  validateOrThrow(validator, body) {
    const result = validator(body);
    if (!result.valid) {
      throw new ValidationError('Validation failed', {
        code: 'VALIDATION_FAILED',
        details: { errors: result.errors },
      });
    }
  }

  createListing = async (req, res, next) => {
    return this.listingController.createListing(req, res, next);
  };

  listListings = async (req, res, next) => {
    return this.listingController.listListings(req, res, next);
  };

  listFeatured = async (req, res, next) => {
    return this.listingController.listFeatured(req, res, next);
  };

  getListing = async (req, res, next) => {
    return this.listingController.getListing(req, res, next);
  };

  getListingBySlug = async (req, res, next) => {
    return this.listingController.getListingBySlug(req, res, next);
  };

  updateListing = async (req, res, next) => {
    return this.listingController.updateListing(req, res, next);
  };

  publishListing = async (req, res, next) => {
    return this.listingController.publishListing(req, res, next);
  };

  unpublishListing = async (req, res, next) => {
    return this.listingController.unpublishListing(req, res, next);
  };

  deleteListing = async (req, res, next) => {
    return this.listingController.deleteListing(req, res, next);
  };

  recordView = async (req, res, next) => {
    return this.listingController.recordView(req, res, next);
  };

  search = async (req, res, next) => {
    try {
      this.validateOrThrow(validateSearchPayload, req.query);
      const filters = {
        search: req.query.search,
        categories: req.query.categories
          ? String(req.query.categories).split(',').map((c) => c.trim())
          : undefined,
        tags: req.query.tags
          ? String(req.query.tags).split(',').map((t) => t.trim())
          : undefined,
        minPrice: req.query.minPrice !== undefined ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice !== undefined ? Number(req.query.maxPrice) : undefined,
        minRating: req.query.minRating !== undefined ? Number(req.query.minRating) : undefined,
        featured:
          req.query.featured !== undefined ? req.query.featured === 'true' : undefined,
        rankingStrategy: req.query.rankingStrategy,
        limit: req.query.limit,
        offset: req.query.offset,
      };
      const result = await this.service.searchListings(filters, req.user?.id || null);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getRecommendations = async (req, res, next) => {
    try {
      const recommendations = await this.service.getRecommendations(
        req.user.id,
        Number(req.query.limit) || 10,
        req.query.strategy,
      );
      res.status(200).json({ recommendations });
    } catch (error) {
      next(error);
    }
  };

  getTrending = async (req, res, next) => {
    try {
      const listings = await this.service.listTrending(Number(req.query.limit) || 20);
      res.status(200).json({ listings });
    } catch (error) {
      next(error);
    }
  };

  addReview = async (req, res, next) => {
    return this.reviewController.addReview(req, res, next);
  };

  listReviews = async (req, res, next) => {
    return this.reviewController.listReviews(req, res, next);
  };

  getReview = async (req, res, next) => {
    return this.reviewController.getReview(req, res, next);
  };

  updateReview = async (req, res, next) => {
    return this.reviewController.updateReview(req, res, next);
  };

  deleteReview = async (req, res, next) => {
    return this.reviewController.deleteReview(req, res, next);
  };

  replyToReview = async (req, res, next) => {
    return this.reviewController.replyToReview(req, res, next);
  };

  getReviewStatusCounts = async (req, res, next) => {
    return this.reviewController.getStatusCounts(req, res, next);
  };

  moderateReview = async (req, res, next) => {
    return this.reviewController.moderateReview(req, res, next);
  };

  listCategories = async (req, res, next) => {
    try {
      const filters = {
        isActive:
          req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
      };
      const categories = await this.service.listCategories(filters);
      res.status(200).json({ categories });
    } catch (error) {
      next(error);
    }
  };

  getCategoryByCode = async (req, res, next) => {
    try {
      const category = await this.service.getCategoryByCode(req.params.code);
      res.status(200).json({ category });
    } catch (error) {
      next(error);
    }
  };

  createCategory = async (req, res, next) => {
    try {
      this.validateOrThrow(validateCategoryPayload, req.body);
      const category = await this.service.createCategory(req.body);
      res.status(201).json({ category });
    } catch (error) {
      next(error);
    }
  };

  updateCategory = async (req, res, next) => {
    try {
      const category = await this.service.updateCategory(
        req.params.categoryId,
        req.body,
      );
      res.status(200).json({ category });
    } catch (error) {
      next(error);
    }
  };

  deleteCategory = async (req, res, next) => {
    try {
      const result = await this.service.deleteCategory(req.params.categoryId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getCategoryCounts = async (req, res, next) => {
    try {
      const counts = await this.service.getCategoryCounts();
      res.status(200).json({ counts });
    } catch (error) {
      next(error);
    }
  };

  compareProviders = async (req, res, next) => {
    try {
      const providerIds = req.body.providerIds || [];
      const comparison = await this.service.compareProviders(providerIds);
      res.status(200).json(comparison);
    } catch (error) {
      next(error);
    }
  };

  computeConsensus = async (req, res, next) => {
    try {
      const providerIds = req.body.providerIds || [];
      const windowHours = Number(req.body.windowHours) || 24;
      const consensus = await this.service.computeConsensus(providerIds, windowHours);
      res.status(200).json({ consensus });
    } catch (error) {
      next(error);
    }
  };
}

export default MarketplaceController;