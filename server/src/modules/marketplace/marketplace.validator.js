/**
 * Marketplace Validators
 *
 * @module signalforge/server/modules/marketplace/validator
 */

import {
  MARKETPLACE_CATEGORY_VALUES,
  LISTING_VISIBILITY_VALUES,
  isValidRating,
} from './marketplace.constants.js';

export function validateListingCreatePayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!body.title || typeof body.title !== 'string') {
    errors.push('title is required');
  } else if (body.title.length > 160) {
    errors.push('title must not exceed 160 characters');
  }

  if (!body.slug || typeof body.slug !== 'string') {
    errors.push('slug is required');
  } else if (!/^[a-z0-9][a-z0-9-]{2,63}$/.test(body.slug)) {
    errors.push('slug must be lowercase alphanumeric with hyphens, 3 to 64 characters');
  }

  if (body.shortDescription !== undefined && body.shortDescription !== null) {
    if (typeof body.shortDescription !== 'string' || body.shortDescription.length > 240) {
      errors.push('shortDescription must not exceed 240 characters');
    }
  }

  if (body.description !== undefined && body.description !== null) {
    if (typeof body.description !== 'string' || body.description.length > 8000) {
      errors.push('description must not exceed 8000 characters');
    }
  }

  if (body.visibility !== undefined && !LISTING_VISIBILITY_VALUES.includes(body.visibility)) {
    errors.push(`visibility must be one of: ${LISTING_VISIBILITY_VALUES.join(', ')}`);
  }

  if (body.categories !== undefined) {
    if (!Array.isArray(body.categories)) {
      errors.push('categories must be an array');
    } else {
      for (const cat of body.categories) {
        if (!MARKETPLACE_CATEGORY_VALUES.includes(cat)) {
          errors.push(`Invalid category: ${cat}`);
        }
      }
    }
  }

  if (body.tags !== undefined && !Array.isArray(body.tags)) {
    errors.push('tags must be an array');
  }

  if (body.price !== undefined) {
    if (typeof body.price !== 'number' || body.price < 0) {
      errors.push('price must be a non-negative number');
    }
  }

  if (body.currency !== undefined) {
    if (typeof body.currency !== 'string' || body.currency.length !== 3) {
      errors.push('currency must be a 3-letter ISO code');
    }
  }

  if (body.billingInterval !== undefined) {
    const allowed = ['MONTHLY', 'YEARLY', 'LIFETIME', 'CUSTOM'];
    if (!allowed.includes(body.billingInterval)) {
      errors.push(`billingInterval must be one of: ${allowed.join(', ')}`);
    }
  }

  if (body.trialDays !== undefined) {
    if (typeof body.trialDays !== 'number' || body.trialDays < 0 || body.trialDays > 90) {
      errors.push('trialDays must be between 0 and 90');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateListingUpdatePayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (body.title !== undefined) {
    if (typeof body.title !== 'string' || body.title.length > 160) {
      errors.push('title must not exceed 160 characters');
    }
  }

  if (body.shortDescription !== undefined && body.shortDescription !== null) {
    if (typeof body.shortDescription !== 'string' || body.shortDescription.length > 240) {
      errors.push('shortDescription must not exceed 240 characters');
    }
  }

  if (body.description !== undefined && body.description !== null) {
    if (typeof body.description !== 'string' || body.description.length > 8000) {
      errors.push('description must not exceed 8000 characters');
    }
  }

  if (body.visibility !== undefined && !LISTING_VISIBILITY_VALUES.includes(body.visibility)) {
    errors.push(`visibility must be one of: ${LISTING_VISIBILITY_VALUES.join(', ')}`);
  }

  if (body.categories !== undefined) {
    if (!Array.isArray(body.categories)) {
      errors.push('categories must be an array');
    } else {
      for (const cat of body.categories) {
        if (!MARKETPLACE_CATEGORY_VALUES.includes(cat)) {
          errors.push(`Invalid category: ${cat}`);
        }
      }
    }
  }

  if (body.price !== undefined) {
    if (typeof body.price !== 'number' || body.price < 0) {
      errors.push('price must be a non-negative number');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateReviewCreatePayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!isValidRating(body.rating)) {
    errors.push('rating must be an integer between 1 and 5');
  }

  if (body.title !== undefined && body.title !== null) {
    if (typeof body.title !== 'string' || body.title.length > 128) {
      errors.push('title must not exceed 128 characters');
    }
  }

  if (body.comment !== undefined && body.comment !== null) {
    if (typeof body.comment !== 'string' || body.comment.length > 2000) {
      errors.push('comment must not exceed 2000 characters');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateReviewUpdatePayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (body.rating !== undefined && !isValidRating(body.rating)) {
    errors.push('rating must be an integer between 1 and 5');
  }

  if (body.title !== undefined && body.title !== null) {
    if (typeof body.title !== 'string' || body.title.length > 128) {
      errors.push('title must not exceed 128 characters');
    }
  }

  if (body.comment !== undefined && body.comment !== null) {
    if (typeof body.comment !== 'string' || body.comment.length > 2000) {
      errors.push('comment must not exceed 2000 characters');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateCategoryPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!body.code || typeof body.code !== 'string') {
    errors.push('code is required');
  } else if (!/^[A-Z][A-Z0-9_]{1,63}$/.test(body.code)) {
    errors.push('code must be uppercase letters, numbers, and underscores');
  }

  if (!body.label || typeof body.label !== 'string') {
    errors.push('label is required');
  } else if (body.label.length > 128) {
    errors.push('label must not exceed 128 characters');
  }

  if (body.displayOrder !== undefined) {
    if (typeof body.displayOrder !== 'number' || body.displayOrder < 0) {
      errors.push('displayOrder must be a non-negative number');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateModerationPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!body.status || !['APPROVED', 'REJECTED', 'FLAGGED', 'HIDDEN'].includes(body.status)) {
    errors.push('status must be APPROVED, REJECTED, FLAGGED, or HIDDEN');
  }

  if (
    ['REJECTED', 'FLAGGED', 'HIDDEN'].includes(body.status) &&
    (!body.reason || typeof body.reason !== 'string')
  ) {
    errors.push('reason is required when rejecting, flagging, or hiding');
  }

  if (body.reason !== undefined) {
    if (typeof body.reason !== 'string' || body.reason.length > 1024) {
      errors.push('reason must not exceed 1024 characters');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateSearchPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (body.limit !== undefined) {
    const limit = Number(body.limit);
    if (!Number.isInteger(limit) || limit < 1 || limit > 200) {
      errors.push('limit must be between 1 and 200');
    }
  }

  if (body.categories !== undefined && !Array.isArray(body.categories)) {
    errors.push('categories must be an array');
  }

  return { valid: errors.length === 0, errors };
}