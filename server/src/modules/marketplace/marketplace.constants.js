/**
 * Marketplace Module Constants
 *
 * @module signalforge/server/modules/marketplace/constants
 */

export const MARKETPLACE_EVENTS = Object.freeze({
  LISTING_CREATED: 'marketplace.listing.created',
  LISTING_UPDATED: 'marketplace.listing.updated',
  LISTING_DELETED: 'marketplace.listing.deleted',
  LISTING_PUBLISHED: 'marketplace.listing.published',
  LISTING_UNPUBLISHED: 'marketplace.listing.unpublished',
  LISTING_FEATURED: 'marketplace.listing.featured',
  LISTING_UNFEATURED: 'marketplace.listing.unfeatured',
  REVIEW_ADDED: 'marketplace.review.added',
  REVIEW_UPDATED: 'marketplace.review.updated',
  REVIEW_DELETED: 'marketplace.review.deleted',
  REVIEW_MODERATED: 'marketplace.review.moderated',
  REVIEW_REPLIED: 'marketplace.review.replied',
  CATEGORY_CREATED: 'marketplace.category.created',
  CATEGORY_UPDATED: 'marketplace.category.updated',
  CATEGORY_DELETED: 'marketplace.category.deleted',
  SEARCH_PERFORMED: 'marketplace.search.performed',
  RECOMMENDATION_GENERATED: 'marketplace.recommendation.generated',
});

export const MARKETPLACE_CATEGORIES = Object.freeze({
  FOREX: 'FOREX',
  CRYPTO: 'CRYPTO',
  INDICES: 'INDICES',
  COMMODITIES: 'COMMODITIES',
  STOCKS: 'STOCKS',
  FUTURES: 'FUTURES',
  OPTIONS: 'OPTIONS',
  MIXED: 'MIXED',
  SCALPING: 'SCALPING',
  DAY_TRADING: 'DAY_TRADING',
  SWING_TRADING: 'SWING_TRADING',
  POSITION_TRADING: 'POSITION_TRADING',
  ALGO_TRADING: 'ALGO_TRADING',
});

export const MARKETPLACE_CATEGORY_VALUES = Object.freeze(
  Object.values(MARKETPLACE_CATEGORIES),
);

export const LISTING_STATUSES = Object.freeze({
  DRAFT: 'DRAFT',
  PENDING_REVIEW: 'PENDING_REVIEW',
  PUBLISHED: 'PUBLISHED',
  UNPUBLISHED: 'UNPUBLISHED',
  ARCHIVED: 'ARCHIVED',
  SUSPENDED: 'SUSPENDED',
  REJECTED: 'REJECTED',
});

export const LISTING_STATUS_VALUES = Object.freeze(Object.values(LISTING_STATUSES));

export const LISTING_VISIBILITY = Object.freeze({
  PUBLIC: 'PUBLIC',
  UNLISTED: 'UNLISTED',
  PRIVATE: 'PRIVATE',
});

export const LISTING_VISIBILITY_VALUES = Object.freeze(
  Object.values(LISTING_VISIBILITY),
);

export const REVIEW_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  FLAGGED: 'FLAGGED',
  HIDDEN: 'HIDDEN',
});

export const REVIEW_STATUS_VALUES = Object.freeze(Object.values(REVIEW_STATUSES));

export const RANKING_STRATEGIES = Object.freeze({
  REPUTATION: 'REPUTATION',
  SUBSCRIBERS: 'SUBSCRIBERS',
  WIN_RATE: 'WIN_RATE',
  AVERAGE_RR: 'AVERAGE_RR',
  CONSISTENCY: 'CONSISTENCY',
  RECENCY: 'RECENCY',
  BALANCED: 'BALANCED',
});

export const RANKING_STRATEGY_VALUES = Object.freeze(
  Object.values(RANKING_STRATEGIES),
);

export const SORT_ORDERS = Object.freeze({
  ASC: 'ASC',
  DESC: 'DESC',
});

export const SORT_ORDER_VALUES = Object.freeze(Object.values(SORT_ORDERS));

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_SEARCH_LIMIT = 50;
export const MAX_REVIEW_LENGTH = 2000;
export const MAX_REVIEWS_PER_USER_PER_PROVIDER = 1;
export const REVIEW_MIN_RATING = 1;
export const REVIEW_MAX_RATING = 5;

export const RECOMMENDATION_STRATEGIES = Object.freeze({
  COLLABORATIVE: 'COLLABORATIVE',
  CONTENT_BASED: 'CONTENT_BASED',
  POPULARITY: 'POPULARITY',
  HYBRID: 'HYBRID',
});

export const RECOMMENDATION_STRATEGY_VALUES = Object.freeze(
  Object.values(RECOMMENDATION_STRATEGIES),
);

export function isValidCategory(category) {
  return MARKETPLACE_CATEGORY_VALUES.includes(category);
}

export function isValidListingStatus(status) {
  return LISTING_STATUS_VALUES.includes(status);
}

export function isValidListingVisibility(visibility) {
  return LISTING_VISIBILITY_VALUES.includes(visibility);
}

export function isValidReviewStatus(status) {
  return REVIEW_STATUS_VALUES.includes(status);
}

export function isValidRankingStrategy(strategy) {
  return RANKING_STRATEGY_VALUES.includes(strategy);
}

export function isValidSortOrder(order) {
  return SORT_ORDER_VALUES.includes(order);
}

export function isValidRating(rating) {
  return (
    Number.isInteger(rating) &&
    rating >= REVIEW_MIN_RATING &&
    rating <= REVIEW_MAX_RATING
  );
}

export function isPublishedListing(listing) {
  return listing && listing.status === LISTING_STATUSES.PUBLISHED;
}