/**
 * Listing Controller
 *
 * @module signalforge/server/modules/marketplace/listings/controller
 */

import { ListingService } from './service.js';
import {
  validateCreateListing,
  validateUpdateListing,
} from './validator.js';
import { ValidationError } from '../../../lib/errors/validation-error.js';

export class ListingController {
  constructor(service = null) {
    this.service = service || new ListingService();
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
    try {
      this.validateOrThrow(validateCreateListing, req.body);
      const listing = await this.service.createForProvider(
        req.params.providerId,
        req.user.id,
        req.body,
      );
      res.status(201).json({ listing });
    } catch (error) {
      next(error);
    }
  };

  listListings = async (req, res, next) => {
    try {
      const filters = {
        categories: req.query.categories
          ? String(req.query.categories).split(',').map((c) => c.trim())
          : undefined,
        tags: req.query.tags
          ? String(req.query.tags).split(',').map((t) => t.trim())
          : undefined,
        search: req.query.search,
        minPrice: req.query.minPrice !== undefined ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice !== undefined ? Number(req.query.maxPrice) : undefined,
        minRating: req.query.minRating !== undefined ? Number(req.query.minRating) : undefined,
        featured:
          req.query.featured !== undefined ? req.query.featured === 'true' : undefined,
      };
      const pagination = { limit: req.query.limit, offset: req.query.offset };
      const result = await this.service.listPublished(filters, pagination);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  listFeatured = async (req, res, next) => {
    try {
      const limit = Number(req.query.limit) || 20;
      const listings = await this.service.listFeatured(limit);
      res.status(200).json({ listings });
    } catch (error) {
      next(error);
    }
  };

  getListing = async (req, res, next) => {
    try {
      const listing = await this.service.getById(req.params.listingId);
      res.status(200).json({ listing });
    } catch (error) {
      next(error);
    }
  };

  getListingBySlug = async (req, res, next) => {
    try {
      const listing = await this.service.getBySlug(req.params.slug);
      res.status(200).json({ listing });
    } catch (error) {
      next(error);
    }
  };

  getMyListing = async (req, res, next) => {
    try {
      const listing = await this.service.getByProviderId(req.params.providerId);
      res.status(200).json({ listing });
    } catch (error) {
      next(error);
    }
  };

  updateListing = async (req, res, next) => {
    try {
      this.validateOrThrow(validateUpdateListing, req.body);
      const listing = await this.service.update(
        req.user.id,
        req.params.listingId,
        req.body,
      );
      res.status(200).json({ listing });
    } catch (error) {
      next(error);
    }
  };

  publishListing = async (req, res, next) => {
    try {
      const listing = await this.service.publish(req.user.id, req.params.listingId);
      res.status(200).json({ listing });
    } catch (error) {
      next(error);
    }
  };

  unpublishListing = async (req, res, next) => {
    try {
      const listing = await this.service.unpublish(req.user.id, req.params.listingId);
      res.status(200).json({ listing });
    } catch (error) {
      next(error);
    }
  };

  featureListing = async (req, res, next) => {
    try {
      const listing = await this.service.feature(
        req.params.listingId,
        req.body.featuredUntil,
      );
      res.status(200).json({ listing });
    } catch (error) {
      next(error);
    }
  };

  unfeatureListing = async (req, res, next) => {
    try {
      const listing = await this.service.unfeature(req.params.listingId);
      res.status(200).json({ listing });
    } catch (error) {
      next(error);
    }
  };

  deleteListing = async (req, res, next) => {
    try {
      const result = await this.service.remove(req.user.id, req.params.listingId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  recordView = async (req, res, next) => {
    try {
      await this.service.recordView(req.params.listingId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

export default ListingController;