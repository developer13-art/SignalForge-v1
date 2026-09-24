/**
 * Review Moderation Service
 *
 * @module signalforge/server/modules/marketplace/reviews/moderation
 */

import { ReviewRepository } from './repository.js';
import { ReviewNotFoundError } from '../marketplace.errors.js';
import {
  REVIEW_STATUSES,
} from '../marketplace.constants.js';
import { emitReviewModerated } from '../marketplace.events.js';

export class ModerationService {
  constructor(repository = null) {
    this.repository = repository || new ReviewRepository();
  }

  async moderate(reviewId, actorId, status, reason) {
    const review = await this.repository.findById(reviewId);
    if (!review) {
      throw new ReviewNotFoundError();
    }

    await this.repository.update(reviewId, {
      status,
      moderatedBy: actorId,
      moderatedAt: new Date(),
      moderationReason: reason || null,
    });

    await emitReviewModerated(reviewId, status, actorId, reason);

    await this.repository.recomputeRating(review.listing_id);

    const updated = await this.repository.findById(reviewId);
    return this.serialize(updated);
  }

  async approve(reviewId, actorId) {
    return this.moderate(reviewId, actorId, REVIEW_STATUSES.APPROVED, null);
  }

  async reject(reviewId, actorId, reason) {
    return this.moderate(reviewId, actorId, REVIEW_STATUSES.REJECTED, reason);
  }

  async flag(reviewId, actorId, reason) {
    return this.moderate(reviewId, actorId, REVIEW_STATUSES.FLAGGED, reason);
  }

  async hide(reviewId, actorId, reason) {
    return this.moderate(reviewId, actorId, REVIEW_STATUSES.HIDDEN, reason);
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
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export default ModerationService;