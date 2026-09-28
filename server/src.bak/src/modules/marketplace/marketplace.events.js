/**
 * Marketplace Event Helpers
 *
 * @module signalforge/server/modules/marketplace/events
 */
const { getEventBus } = require('../../bootstrap/initEventBus.js');
const { MARKETPLACE_EVENTS } = require('./marketplace.constants.js');

function publish(eventType, payload, options = {}) {
  const bus = getEventBus();
  return bus.publish(eventType, payload, {
    source: 'marketplace',
    sourceVersion: '1.0.0',
    ...options,
  });
}
function emitListingCreated(listingId, providerId, userId, meta = {}) {
  return publish(MARKETPLACE_EVENTS.LISTING_CREATED, {
    listingId,
    providerId,
    userId,
    createdAt: new Date().toISOString(),
    ...meta,
  });
}
function emitListingUpdated(listingId, changes, meta = {}) {
  return publish(MARKETPLACE_EVENTS.LISTING_UPDATED, {
    listingId,
    changes,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitListingDeleted(listingId, meta = {}) {
  return publish(MARKETPLACE_EVENTS.LISTING_DELETED, {
    listingId,
    deletedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitListingPublished(listingId, meta = {}) {
  return publish(MARKETPLACE_EVENTS.LISTING_PUBLISHED, {
    listingId,
    publishedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitListingUnpublished(listingId, meta = {}) {
  return publish(MARKETPLACE_EVENTS.LISTING_UNPUBLISHED, {
    listingId,
    unpublishedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitListingFeatured(listingId, featuredUntil, meta = {}) {
  return publish(MARKETPLACE_EVENTS.LISTING_FEATURED, {
    listingId,
    featuredUntil,
    featuredAt: new Date().toISOString(),
    ...meta,
  });
}
function emitListingUnfeatured(listingId, meta = {}) {
  return publish(MARKETPLACE_EVENTS.LISTING_UNFEATURED, {
    listingId,
    unfeaturedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitReviewAdded(reviewId, listingId, reviewerId, rating, meta = {}) {
  return publish(MARKETPLACE_EVENTS.REVIEW_ADDED, {
    reviewId,
    listingId,
    reviewerId,
    rating,
    addedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitReviewUpdated(reviewId, changes, meta = {}) {
  return publish(MARKETPLACE_EVENTS.REVIEW_UPDATED, {
    reviewId,
    changes,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitReviewDeleted(reviewId, meta = {}) {
  return publish(MARKETPLACE_EVENTS.REVIEW_DELETED, {
    reviewId,
    deletedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitReviewModerated(reviewId, status, actorId, reason, meta = {}) {
  return publish(MARKETPLACE_EVENTS.REVIEW_MODERATED, {
    reviewId,
    status,
    actorId,
    reason,
    moderatedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitReviewReplied(reviewId, repliedBy, meta = {}) {
  return publish(MARKETPLACE_EVENTS.REVIEW_REPLIED, {
    reviewId,
    repliedBy,
    repliedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitCategoryCreated(categoryId, code, meta = {}) {
  return publish(MARKETPLACE_EVENTS.CATEGORY_CREATED, {
    categoryId,
    code,
    createdAt: new Date().toISOString(),
    ...meta,
  });
}
function emitCategoryUpdated(categoryId, changes, meta = {}) {
  return publish(MARKETPLACE_EVENTS.CATEGORY_UPDATED, {
    categoryId,
    changes,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitCategoryDeleted(categoryId, code, meta = {}) {
  return publish(MARKETPLACE_EVENTS.CATEGORY_DELETED, {
    categoryId,
    code,
    deletedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitSearchPerformed(userId, filters, resultCount, meta = {}) {
  return publish(MARKETPLACE_EVENTS.SEARCH_PERFORMED, {
    userId,
    filters,
    resultCount,
    searchedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitRecommendationGenerated(userId, listingIds, strategy, meta = {}) {
  return publish(MARKETPLACE_EVENTS.RECOMMENDATION_GENERATED, {
    userId,
    listingIds,
    strategy,
    generatedAt: new Date().toISOString(),
    ...meta,
  });
}

module.exports.emitListingCreated = emitListingCreated;
module.exports.emitListingUpdated = emitListingUpdated;
module.exports.emitListingDeleted = emitListingDeleted;
module.exports.emitListingPublished = emitListingPublished;
module.exports.emitListingUnpublished = emitListingUnpublished;
module.exports.emitListingFeatured = emitListingFeatured;
module.exports.emitListingUnfeatured = emitListingUnfeatured;
module.exports.emitReviewAdded = emitReviewAdded;
module.exports.emitReviewUpdated = emitReviewUpdated;
module.exports.emitReviewDeleted = emitReviewDeleted;
module.exports.emitReviewModerated = emitReviewModerated;
module.exports.emitReviewReplied = emitReviewReplied;
module.exports.emitCategoryCreated = emitCategoryCreated;
module.exports.emitCategoryUpdated = emitCategoryUpdated;
module.exports.emitCategoryDeleted = emitCategoryDeleted;
module.exports.emitSearchPerformed = emitSearchPerformed;
module.exports.emitRecommendationGenerated = emitRecommendationGenerated;
