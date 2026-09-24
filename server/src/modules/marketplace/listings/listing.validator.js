/**
 * Listing Validator
 *
 * @module signalforge/server/modules/marketplace/listings/validator
 */

import {
  validateListingCreatePayload,
  validateListingUpdatePayload,
} from '../marketplace.validator.js';

export function validateCreateListing(body) {
  return validateListingCreatePayload(body);
}

export function validateUpdateListing(body) {
  return validateListingUpdatePayload(body);
}