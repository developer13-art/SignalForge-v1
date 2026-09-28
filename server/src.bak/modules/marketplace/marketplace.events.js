/**
 * Marketplace Event Helpers
 *
 * @module signalforge/server/modules/marketplace/events
 */

import { getEventBus } from '../../bootstrap/initEventBus.js';
import { MARKETPLACE_EVENTS } from './marketplace.constants.js';

function publish(eventType, payload, options = {}) {
  const bus = getEventBus();
  return bus.publish(eventType, payload, {
    source: 'marketplace',
    sourceVersion: '1.0.0',
    ...options,
  });
}

export function emitListingCreated(listingId, providerId, userId, meta = {}) {
  return publish(MARKETPLACE_EVENTS.LISTING_CREATED, {
    listingId,
    providerId,
    userId,
    createdAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitListingUpdated(listingId, changes, meta = {}) {
  return publish(MARKETPLACE_EVENTS.LISTING_UPDATED, {
    listingId,
    changes,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitListingDeleted(listingId, meta = {}) {
  return publish(MARKETPLACE_EVENTS.LISTING_DELETED, {
    listingId,
    deletedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitListingPublished(listingId, meta = {}) {
  return publish(MARKETPLACE_EVENTS.LISTING_PUBLISHED, {
    listingId,
    publishedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitListingUnpublished(listingId, meta = {}) {
  return publish(MARKETPLACE_EVENTS.LISTING_UNPUBLISHED, {
    listingId,
    unpublishedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitListingFeatured(listingId, featuredUntil, meta = {}) {
  return publish(MARKETPLACE_EVENTS.LISTING_FEATURED, {
    listingId,
    featuredUntil,
    featuredAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitListingUnfeatured(listingId, meta = {}) {
  return publish(MARKETPLACE_EVENTS.LISTING_UNFEATURED, {
    listingId,
    unfeaturedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitReviewAdded(reviewId, listingId, reviewerId, rating, meta = {}) {
  return publish(MARKETPLACE_EVENTS.REVIEW_ADDED, {
    reviewId,
    listingId,
    reviewerId,
    rating,
    addedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitReviewUpdated(reviewId, changes, meta = {}) {
  return publish(MARKETPLACE_EVENTS.REVIEW_UPDATED, {
    reviewId,
    changes,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitReviewDeleted(reviewId, meta = {}) {
  return publish(MARKETPLACE_EVENTS.REVIEW_DELETED, {
    reviewId,
    deletedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitReviewModerated(reviewId, status, actorId, reason, meta = {}) {
  return publish(MARKETPLACE_EVENTS.REVIEW_MODERATED, {
    reviewId,
    status,
    actorId,
    reason,
    moderatedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitReviewReplied(reviewId, repliedBy, meta = {}) {
  return publish(MARKETPLACE_EVENTS.REVIEW_REPLIED, {
    reviewId,
    repliedBy,
    repliedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitCategoryCreated(categoryId, code, meta = {}) {
  return publish(MARKETPLACE_EVENTS.CATEGORY_CREATED, {
    categoryId,
    code,
    createdAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitCategoryUpdated(categoryId, changes, meta = {}) {
  return publish(MARKETPLACE_EVENTS.CATEGORY_UPDATED, {
    categoryId,
    changes,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitCategoryDeleted(categoryId, code, meta = {}) {
  return publish(MARKETPLACE_EVENTS.CATEGORY_DELETED, {
    categoryId,
    code,
    deletedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitSearchPerformed(userId, filters, resultCount, meta = {}) {
  return publish(MARKETPLACE_EVENTS.SEARCH_PERFORMED, {
    userId,
    filters,
    resultCount,
    searchedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitRecommendationGenerated(userId, listingIds, strategy, meta = {}) {
  return publish(MARKETPLACE_EVENTS.RECOMMENDATION_GENERATED, {
    userId,
    listingIds,
    strategy,
    generatedAt: new Date().toISOString(),
    ...meta,
  });
}

export { MARKETPLACE_EVENTS };