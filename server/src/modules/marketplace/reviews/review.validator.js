/**
 * Review Validator
 *
 * @module signalforge/server/modules/marketplace/reviews/validator
 */

import {
  validateReviewCreatePayload,
  validateReviewUpdatePayload,
  validateModerationPayload,
} from '../marketplace.validator.js';

export function validateCreateReview(body) {
  return validateReviewCreatePayload(body);
}

export function validateUpdateReview(body) {
  return validateReviewUpdatePayload(body);
}

export function validateReviewModeration(body) {
  return validateModerationPayload(body);
}