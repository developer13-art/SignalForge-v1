/**
 * Review Controller
 *
 * @module signalforge/server/modules/marketplace/reviews/controller
 */

import { ReviewService } from './service.js';
import {
  validateCreateReview,
  validateUpdateReview,
  validateReviewModeration,
} from './validator.js';
import { ValidationError } from '../../../lib/errors/validation-error.js';

export class ReviewController {
  constructor(service = null) {
    this.service = service || new ReviewService();
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

  addReview = async (req, res, next) => {
    try {
      this.validateOrThrow(validateCreateReview, req.body);
      const review = await this.service.addReview(
        req.params.listingId,
        req.user.id,
        req.body,
      );
      res.status(201).json({ review });
    } catch (error) {
      next(error);
    }
  };

  listReviews = async (req, res, next) => {
    try {
      const filters = {
        status: req.query.status,
        minRating: req.query.minRating !== undefined ? Number(req.query.minRating) : undefined,
        verifiedOnly: req.query.verifiedOnly === 'true',
      };
      const pagination = { limit: req.query.limit, offset: req.query.offset };
      const result = await this.service.listReviews(
        req.params.listingId,
        filters,
        pagination,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getReview = async (req, res, next) => {
    try {
      const review = await this.service.getById(req.params.reviewId);
      res.status(200).json({ review });
    } catch (error) {
      next(error);
    }
  };

  updateReview = async (req, res, next) => {
    try {
      this.validateOrThrow(validateUpdateReview, req.body);
      const review = await this.service.updateReview(
        req.user.id,
        req.params.reviewId,
        req.body,
      );
      res.status(200).json({ review });
    } catch (error) {
      next(error);
    }
  };

  deleteReview = async (req, res, next) => {
    try {
      const result = await this.service.deleteReview(
        req.user.id,
        req.params.reviewId,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  replyToReview = async (req, res, next) => {
    try {
      const review = await this.service.replyToReview(
        req.user.id,
        req.params.reviewId,
        req.body.reply,
      );
      res.status(200).json({ review });
    } catch (error) {
      next(error);
    }
  };

  getStatusCounts = async (req, res, next) => {
    try {
      const counts = await this.service.getStatusCounts(req.params.listingId);
      res.status(200).json({ counts });
    } catch (error) {
      next(error);
    }
  };

  moderateReview = async (req, res, next) => {
    try {
      this.validateOrThrow(validateReviewModeration, req.body);
      const review =
        req.body.status === 'APPROVED'
          ? await this.service.approve(req.params.reviewId, req.user.id)
          : req.body.status === 'REJECTED'
            ? await this.service.reject(req.params.reviewId, req.user.id, req.body.reason)
            : req.body.status === 'FLAGGED'
              ? await this.service.flag(req.params.reviewId, req.user.id, req.body.reason)
              : await this.service.hide(req.params.reviewId, req.user.id, req.body.reason);
      res.status(200).json({ review });
    } catch (error) {
      next(error);
    }
  };
}

export default ReviewController;