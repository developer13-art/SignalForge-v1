/**
 * Marketplace Module Constants
 *
 * @module signalforge/server/modules/marketplace/constants
 */
const MARKETPLACE_EVENTS = Object.freeze({
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
const MARKETPLACE_CATEGORIES = Object.freeze({
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
const MARKETPLACE_CATEGORY_VALUES = Object.freeze(
  Object.values(MARKETPLACE_CATEGORIES),
);
const LISTING_STATUSES = Object.freeze({
  DRAFT: 'DRAFT',
  PENDING_REVIEW: 'PENDING_REVIEW',
  PUBLISHED: 'PUBLISHED',
  UNPUBLISHED: 'UNPUBLISHED',
  ARCHIVED: 'ARCHIVED',
  SUSPENDED: 'SUSPENDED',
  REJECTED: 'REJECTED',
});
const LISTING_STATUS_VALUES = Object.freeze(Object.values(LISTING_STATUSES));
const LISTING_VISIBILITY = Object.freeze({
  PUBLIC: 'PUBLIC',
  UNLISTED: 'UNLISTED',
  PRIVATE: 'PRIVATE',
});
const LISTING_VISIBILITY_VALUES = Object.freeze(
  Object.values(LISTING_VISIBILITY),
);
const REVIEW_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  FLAGGED: 'FLAGGED',
  HIDDEN: 'HIDDEN',
});
const REVIEW_STATUS_VALUES = Object.freeze(Object.values(REVIEW_STATUSES));
const RANKING_STRATEGIES = Object.freeze({
  REPUTATION: 'REPUTATION',
  SUBSCRIBERS: 'SUBSCRIBERS',
  WIN_RATE: 'WIN_RATE',
  AVERAGE_RR: 'AVERAGE_RR',
  CONSISTENCY: 'CONSISTENCY',
  RECENCY: 'RECENCY',
  BALANCED: 'BALANCED',
});
const RANKING_STRATEGY_VALUES = Object.freeze(
  Object.values(RANKING_STRATEGIES),
);
const SORT_ORDERS = Object.freeze({
  ASC: 'ASC',
  DESC: 'DESC',
});
const SORT_ORDER_VALUES = Object.freeze(Object.values(SORT_ORDERS));
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const DEFAULT_SEARCH_LIMIT = 50;
const MAX_REVIEW_LENGTH = 2000;
const MAX_REVIEWS_PER_USER_PER_PROVIDER = 1;
const REVIEW_MIN_RATING = 1;
const REVIEW_MAX_RATING = 5;
const RECOMMENDATION_STRATEGIES = Object.freeze({
  COLLABORATIVE: 'COLLABORATIVE',
  CONTENT_BASED: 'CONTENT_BASED',
  POPULARITY: 'POPULARITY',
  HYBRID: 'HYBRID',
});
const RECOMMENDATION_STRATEGY_VALUES = Object.freeze(
  Object.values(RECOMMENDATION_STRATEGIES),
);
function isValidCategory(category) {
  return MARKETPLACE_CATEGORY_VALUES.includes(category);
}
function isValidListingStatus(status) {
  return LISTING_STATUS_VALUES.includes(status);
}
function isValidListingVisibility(visibility) {
  return LISTING_VISIBILITY_VALUES.includes(visibility);
}
function isValidReviewStatus(status) {
  return REVIEW_STATUS_VALUES.includes(status);
}
function isValidRankingStrategy(strategy) {
  return RANKING_STRATEGY_VALUES.includes(strategy);
}
function isValidSortOrder(order) {
  return SORT_ORDER_VALUES.includes(order);
}
function isValidRating(rating) {
  return (
    Number.isInteger(rating) &&
    rating >= REVIEW_MIN_RATING &&
    rating <= REVIEW_MAX_RATING
  );
}
function isPublishedListing(listing) {
  return listing && listing.status === LISTING_STATUSES.PUBLISHED;
}
module.exports.MARKETPLACE_EVENTS = MARKETPLACE_EVENTS;
module.exports.MARKETPLACE_CATEGORIES = MARKETPLACE_CATEGORIES;
module.exports.MARKETPLACE_CATEGORY_VALUES = MARKETPLACE_CATEGORY_VALUES;
module.exports.LISTING_STATUSES = LISTING_STATUSES;
module.exports.LISTING_STATUS_VALUES = LISTING_STATUS_VALUES;
module.exports.LISTING_VISIBILITY = LISTING_VISIBILITY;
module.exports.LISTING_VISIBILITY_VALUES = LISTING_VISIBILITY_VALUES;
module.exports.REVIEW_STATUSES = REVIEW_STATUSES;
module.exports.REVIEW_STATUS_VALUES = REVIEW_STATUS_VALUES;
module.exports.RANKING_STRATEGIES = RANKING_STRATEGIES;
module.exports.RANKING_STRATEGY_VALUES = RANKING_STRATEGY_VALUES;
module.exports.SORT_ORDERS = SORT_ORDERS;
module.exports.SORT_ORDER_VALUES = SORT_ORDER_VALUES;
module.exports.DEFAULT_PAGE_SIZE = DEFAULT_PAGE_SIZE;
module.exports.MAX_PAGE_SIZE = MAX_PAGE_SIZE;
module.exports.DEFAULT_SEARCH_LIMIT = DEFAULT_SEARCH_LIMIT;
module.exports.MAX_REVIEW_LENGTH = MAX_REVIEW_LENGTH;
module.exports.MAX_REVIEWS_PER_USER_PER_PROVIDER = MAX_REVIEWS_PER_USER_PER_PROVIDER;
module.exports.REVIEW_MIN_RATING = REVIEW_MIN_RATING;
module.exports.REVIEW_MAX_RATING = REVIEW_MAX_RATING;
module.exports.RECOMMENDATION_STRATEGIES = RECOMMENDATION_STRATEGIES;
module.exports.RECOMMENDATION_STRATEGY_VALUES = RECOMMENDATION_STRATEGY_VALUES;
module.exports.isValidCategory = isValidCategory;
module.exports.isValidListingStatus = isValidListingStatus;
module.exports.isValidListingVisibility = isValidListingVisibility;
module.exports.isValidReviewStatus = isValidReviewStatus;
module.exports.isValidRankingStrategy = isValidRankingStrategy;
module.exports.isValidSortOrder = isValidSortOrder;
module.exports.isValidRating = isValidRating;
module.exports.isPublishedListing = isPublishedListing;
