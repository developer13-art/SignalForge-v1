/**
 * Review Validator
 *
 * @module signalforge/server/modules/marketplace/reviews/validator
 */
const { validateReviewCreatePayload, validateReviewUpdatePayload, validateModerationPayload } = require('../marketplace.validator.js');
function validateCreateReview(body) {
  return validateReviewCreatePayload(body);
}
function validateUpdateReview(body) {
  return validateReviewUpdatePayload(body);
}
function validateReviewModeration(body) {
  return validateModerationPayload(body);
}
module.exports.validateCreateReview = validateCreateReview;
module.exports.validateUpdateReview = validateUpdateReview;
module.exports.validateReviewModeration = validateReviewModeration;
