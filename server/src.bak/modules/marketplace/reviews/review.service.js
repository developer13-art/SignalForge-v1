/**
 * Review Service
 *
 * @module signalforge/server/modules/marketplace/reviews/service
 */

import { ReviewRepository } from './repository.js';
import { ModerationService } from './moderation.js';
import { ListingRepository } from '../listings/repository.js';
import {
  REVIEW_STATUSES,
  LISTING_STATUSES,
} from '../marketplace.constants.js';
import {
  ReviewNotFoundError,
  ReviewAlreadyExistsError,
  ReviewNotOwnedError,
  CannotReviewOwnListingError,
  ListingNotPublishedError,
} from '../marketplace.errors.js';
import {
  emitReviewAdded,
  emitReviewUpdated,
  emitReviewDeleted,
  emitReviewReplied,
} from '../marketplace.events.js';

export class ReviewService {
  constructor(repository = null, listingRepository = null, moderation = null) {
    this.repository = repository || new ReviewRepository();
    this.listings = listingRepository || new ListingRepository();
    this.moderation = moderation || new ModerationService(this.repository);
  }

  async addReview(listingId, reviewerId, payload) {
    const listing = await this.listings.findById(listingId);
    if (!listing) {
      throw new ReviewNotFoundError('Listing not found');
    }
    if (listing.status !== LISTING_STATUSES.PUBLISHED) {
      throw new ListingNotPublishedError();
    }
    if (listing.user_id === reviewerId) {
      throw new CannotReviewOwnListingError();
    }

    const existing = await this.repository.findByListingAndReviewer(
      listingId,
      reviewerId,
    );
    if (existing) {
      throw new ReviewAlreadyExistsError();
    }

    const created = await this.repository.create({
      listingId,
      providerId: listing.provider_id,
      reviewerId,
      rating: payload.rating,
      title: payload.title || null,
      comment: payload.comment || null,
      status: REVIEW_STATUSES.PENDING,
      verifiedSubscriber: payload.verifiedSubscriber === true,
      metadata: payload.metadata || null,
    });

    if (!created) {
      throw new ReviewAlreadyExistsError();
    }

    await emitReviewAdded(created.id, listingId, reviewerId, payload.rating);

    return this.getById(created.id);
  }

  async getById(reviewId) {
    const review = await this.repository.findById(reviewId);
    if (!review) {
      throw new ReviewNotFoundError();
    }
    return this.serialize(review);
  }

  async listReviews(listingId, filters = {}, pagination = {}) {
    const result = await this.repository.list(listingId, filters, pagination);
    return {
      reviews: result.reviews.map((r) => this.serialize(r)),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    };
  }

  async updateReview(reviewerId, reviewId, payload) {
    const review = await this.repository.findById(reviewId);
    if (!review) {
      throw new ReviewNotFoundError();
    }
    if (review.reviewer_id !== reviewerId) {
      throw new ReviewNotOwnedError();
    }
    await this.repository.update(reviewId, {
      ...payload,
      status: REVIEW_STATUSES.PENDING,
    });
    await this.repository.recomputeRating(review.listing_id);
    const updated = await this.repository.findById(reviewId);
    await emitReviewUpdated(reviewId, Object.keys(payload));
    return this.serialize(updated);
  }

  async deleteReview(reviewerId, reviewId) {
    const review = await this.repository.findById(reviewId);
    if (!review) {
      throw new ReviewNotFoundError();
    }
    if (review.reviewer_id !== reviewerId) {
      throw new ReviewNotOwnedError();
    }
    await this.repository.delete(reviewId);
    await this.repository.recomputeRating(review.listing_id);
    await emitReviewDeleted(reviewId);
    return { deleted: true };
  }

  async replyToReview(providerUserId, reviewId, reply) {
    const review = await this.repository.findById(reviewId);
    if (!review) {
      throw new ReviewNotFoundError();
    }
    const listing = await this.listings.findById(review.listing_id);
    if (!listing || listing.user_id !== providerUserId) {
      throw new ReviewNotOwnedError('Only the provider owner can reply');
    }

    await this.repository.update(reviewId, {
      reply,
      repliedAt: new Date(),
      repliedBy: providerUserId,
    });

    await emitReviewReplied(reviewId, providerUserId);

    const updated = await this.repository.findById(reviewId);
    return this.serialize(updated);
  }

  async getStatusCounts(listingId) {
    return this.repository.countByStatus(listingId);
  }

  async approve(reviewId, actorId) {
    return this.moderation.approve(reviewId, actorId);
  }

  async reject(reviewId, actorId, reason) {
    return this.moderation.reject(reviewId, actorId, reason);
  }

  async flag(reviewId, actorId, reason) {
    return this.moderation.flag(reviewId, actorId, reason);
  }

  async hide(reviewId, actorId, reason) {
    return this.moderation.hide(reviewId, actorId, reason);
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      listingId: row.listing_id,
      providerId: row.provider_id,
      reviewerId: row.reviewer_id,
      rating: row.rating,
      title: row.title,
      comment: row.comment,
      status: row.status,
      verifiedSubscriber: row.verified_subscriber,
      moderatedBy: row.moderated_by,
      moderatedAt: row.moderated_at,
      moderationReason: row.moderation_reason,
      reply: row.reply,
      repliedAt: row.replied_at,
      repliedBy: row.replied_by,
      metadata: this.parseJson(row.metadata),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  parseJson(input) {
    if (!input) {
      return null;
    }
    if (typeof input === 'string') {
      try {
        return JSON.parse(input);
      } catch {
        return null;
      }
    }
    return input;
  }
}

export default ReviewService;