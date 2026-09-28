/**
 * Listing Validator
 *
 * @module signalforge/server/modules/marketplace/listings/validator
 */
const { validateListingCreatePayload, validateListingUpdatePayload } = require('../marketplace.validator.js');
function validateCreateListing(body) {
  return validateListingCreatePayload(body);
}
function validateUpdateListing(body) {
  return validateListingUpdatePayload(body);
}
module.exports.validateCreateListing = validateCreateListing;
module.exports.validateUpdateListing = validateUpdateListing;
