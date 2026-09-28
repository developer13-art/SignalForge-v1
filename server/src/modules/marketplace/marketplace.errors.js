/**
 * Marketplace Module Errors
 *
 * @module signalforge/server/modules/marketplace/errors
 */
const { NotFoundError } = require('../../lib/errors/not-found-error.js');
const { ValidationError } = require('../../lib/errors/validation-error.js');
const { ConflictError } = require('../../lib/errors/conflict-error.js');
const { AuthorizationError } = require('../../lib/errors/authorization-error.js');
class ListingNotFoundError extends NotFoundError {
  constructor(message = 'Marketplace listing not found', details = {}) {
    super(message, { code: 'LISTING_NOT_FOUND', details });
    this.name = 'ListingNotFoundError';
  }
}
class ListingAlreadyExistsError extends ConflictError {
  constructor(message = 'A listing already exists for this provider') {
    super(message, { code: 'LISTING_ALREADY_EXISTS' });
    this.name = 'ListingAlreadyExistsError';
  }
}
class ListingNotOwnedError extends AuthorizationError {
  constructor(message = 'Listing does not belong to this user') {
    super(message, { code: 'LISTING_NOT_OWNED' });
    this.name = 'ListingNotOwnedError';
  }
}
class ListingNotEditableError extends ConflictError {
  constructor(message = 'Listing cannot be edited in its current state', details = {}) {
    super(message, { code: 'LISTING_NOT_EDITABLE', details });
    this.name = 'ListingNotEditableError';
  }
}
class ListingNotPublishedError extends ConflictError {
  constructor(message = 'Listing is not published', details = {}) {
    super(message, { code: 'LISTING_NOT_PUBLISHED', details });
    this.name = 'ListingNotPublishedError';
  }
}
class ReviewNotFoundError extends NotFoundError {
  constructor(message = 'Review not found', details = {}) {
    super(message, { code: 'REVIEW_NOT_FOUND', details });
    this.name = 'ReviewNotFoundError';
  }
}
class ReviewAlreadyExistsError extends ConflictError {
  constructor(message = 'Review already exists for this provider') {
    super(message, { code: 'REVIEW_ALREADY_EXISTS' });
    this.name = 'ReviewAlreadyExistsError';
  }
}
class ReviewNotOwnedError extends AuthorizationError {
  constructor(message = 'Review does not belong to this user') {
    super(message, { code: 'REVIEW_NOT_OWNED' });
    this.name = 'ReviewNotOwnedError';
  }
}
class InvalidReviewPayloadError extends ValidationError {
  constructor(message = 'Review payload is invalid', details = {}) {
    super(message, { code: 'INVALID_REVIEW_PAYLOAD', details });
    this.name = 'InvalidReviewPayloadError';
  }
}
class CategoryNotFoundError extends NotFoundError {
  constructor(message = 'Marketplace category not found', details = {}) {
    super(message, { code: 'CATEGORY_NOT_FOUND', details });
    this.name = 'CategoryNotFoundError';
  }
}
class InvalidListingPayloadError extends ValidationError {
  constructor(message = 'Listing payload is invalid', details = {}) {
    super(message, { code: 'INVALID_LISTING_PAYLOAD', details });
    this.name = 'InvalidListingPayloadError';
  }
}
class SearchFailedError extends Error {
  constructor(message = 'Marketplace search failed', details = {}) {
    super(message);
    this.name = 'SearchFailedError';
    this.code = 'SEARCH_FAILED';
    this.details = details;
  }
}
class ComparisonFailedError extends Error {
  constructor(message = 'Provider comparison failed', details = {}) {
    super(message);
    this.name = 'ComparisonFailedError';
    this.code = 'COMPARISON_FAILED';
    this.details = details;
  }
}
class CannotReviewOwnListingError extends AuthorizationError {
  constructor(message = 'You cannot review your own listing') {
    super(message, { code: 'CANNOT_REVIEW_OWN_LISTING' });
    this.name = 'CannotReviewOwnListingError';
  }
}
module.exports.ListingNotFoundError = ListingNotFoundError;
module.exports.ListingAlreadyExistsError = ListingAlreadyExistsError;
module.exports.ListingNotOwnedError = ListingNotOwnedError;
module.exports.ListingNotEditableError = ListingNotEditableError;
module.exports.ListingNotPublishedError = ListingNotPublishedError;
module.exports.ReviewNotFoundError = ReviewNotFoundError;
module.exports.ReviewAlreadyExistsError = ReviewAlreadyExistsError;
module.exports.ReviewNotOwnedError = ReviewNotOwnedError;
module.exports.InvalidReviewPayloadError = InvalidReviewPayloadError;
module.exports.CategoryNotFoundError = CategoryNotFoundError;
module.exports.InvalidListingPayloadError = InvalidListingPayloadError;
module.exports.SearchFailedError = SearchFailedError;
module.exports.ComparisonFailedError = ComparisonFailedError;
module.exports.CannotReviewOwnListingError = CannotReviewOwnListingError;
