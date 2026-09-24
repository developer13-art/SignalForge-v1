/**
 * Marketplace Module Errors
 *
 * @module signalforge/server/modules/marketplace/errors
 */

import { NotFoundError } from '../../lib/errors/not-found-error.js';
import { ValidationError } from '../../lib/errors/validation-error.js';
import { ConflictError } from '../../lib/errors/conflict-error.js';
import { AuthorizationError } from '../../lib/errors/authorization-error.js';

export class ListingNotFoundError extends NotFoundError {
  constructor(message = 'Marketplace listing not found', details = {}) {
    super(message, { code: 'LISTING_NOT_FOUND', details });
    this.name = 'ListingNotFoundError';
  }
}

export class ListingAlreadyExistsError extends ConflictError {
  constructor(message = 'A listing already exists for this provider') {
    super(message, { code: 'LISTING_ALREADY_EXISTS' });
    this.name = 'ListingAlreadyExistsError';
  }
}

export class ListingNotOwnedError extends AuthorizationError {
  constructor(message = 'Listing does not belong to this user') {
    super(message, { code: 'LISTING_NOT_OWNED' });
    this.name = 'ListingNotOwnedError';
  }
}

export class ListingNotEditableError extends ConflictError {
  constructor(message = 'Listing cannot be edited in its current state', details = {}) {
    super(message, { code: 'LISTING_NOT_EDITABLE', details });
    this.name = 'ListingNotEditableError';
  }
}

export class ListingNotPublishedError extends ConflictError {
  constructor(message = 'Listing is not published', details = {}) {
    super(message, { code: 'LISTING_NOT_PUBLISHED', details });
    this.name = 'ListingNotPublishedError';
  }
}

export class ReviewNotFoundError extends NotFoundError {
  constructor(message = 'Review not found', details = {}) {
    super(message, { code: 'REVIEW_NOT_FOUND', details });
    this.name = 'ReviewNotFoundError';
  }
}

export class ReviewAlreadyExistsError extends ConflictError {
  constructor(message = 'Review already exists for this provider') {
    super(message, { code: 'REVIEW_ALREADY_EXISTS' });
    this.name = 'ReviewAlreadyExistsError';
  }
}

export class ReviewNotOwnedError extends AuthorizationError {
  constructor(message = 'Review does not belong to this user') {
    super(message, { code: 'REVIEW_NOT_OWNED' });
    this.name = 'ReviewNotOwnedError';
  }
}

export class InvalidReviewPayloadError extends ValidationError {
  constructor(message = 'Review payload is invalid', details = {}) {
    super(message, { code: 'INVALID_REVIEW_PAYLOAD', details });
    this.name = 'InvalidReviewPayloadError';
  }
}

export class CategoryNotFoundError extends NotFoundError {
  constructor(message = 'Marketplace category not found', details = {}) {
    super(message, { code: 'CATEGORY_NOT_FOUND', details });
    this.name = 'CategoryNotFoundError';
  }
}

export class InvalidListingPayloadError extends ValidationError {
  constructor(message = 'Listing payload is invalid', details = {}) {
    super(message, { code: 'INVALID_LISTING_PAYLOAD', details });
    this.name = 'InvalidListingPayloadError';
  }
}

export class SearchFailedError extends Error {
  constructor(message = 'Marketplace search failed', details = {}) {
    super(message);
    this.name = 'SearchFailedError';
    this.code = 'SEARCH_FAILED';
    this.details = details;
  }
}

export class ComparisonFailedError extends Error {
  constructor(message = 'Provider comparison failed', details = {}) {
    super(message);
    this.name = 'ComparisonFailedError';
    this.code = 'COMPARISON_FAILED';
    this.details = details;
  }
}

export class CannotReviewOwnListingError extends AuthorizationError {
  constructor(message = 'You cannot review your own listing') {
    super(message, { code: 'CANNOT_REVIEW_OWN_LISTING' });
    this.name = 'CannotReviewOwnListingError';
  }
}