/**
 * Affiliate Validators
 *
 * @module signalforge/server/modules/affiliate/validator
 */

import {
  AFFILIATE_TIER_VALUES,
  AFFILIATE_LINK_TYPE_VALUES,
} from './affiliate.constants.js';

export function validatePartnerRegistrationPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!body.displayName || typeof body.displayName !== 'string') {
    errors.push('displayName is required');
  } else if (body.displayName.length > 128) {
    errors.push('displayName must not exceed 128 characters');
  }

  if (body.slug !== undefined) {
    if (typeof body.slug !== 'string') {
      errors.push('slug must be a string');
    } else if (!/^[a-z0-9][a-z0-9-]{2,63}$/.test(body.slug)) {
      errors.push('slug must be lowercase alphanumeric with hyphens, 3 to 64 characters');
    }
  }

  if (body.bio !== undefined && body.bio !== null) {
    if (typeof body.bio !== 'string' || body.bio.length > 2000) {
      errors.push('bio must not exceed 2000 characters');
    }
  }

  if (body.tier !== undefined && !AFFILIATE_TIER_VALUES.includes(body.tier)) {
    errors.push(`tier must be one of: ${AFFILIATE_TIER_VALUES.join(', ')}`);
  }

  if (body.websiteUrl !== undefined && body.websiteUrl !== null) {
    if (typeof body.websiteUrl !== 'string' || body.websiteUrl.length > 512) {
      errors.push('websiteUrl must not exceed 512 characters');
    }
  }

  if (body.socialLinks !== undefined && body.socialLinks !== null) {
    if (typeof body.socialLinks !== 'object') {
      errors.push('socialLinks must be an object');
    }
  }

  if (body.tags !== undefined && !Array.isArray(body.tags)) {
    errors.push('tags must be an array');
  }

  return { valid: errors.length === 0, errors };
}

export function validatePartnerUpdatePayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (body.displayName !== undefined) {
    if (typeof body.displayName !== 'string' || body.displayName.length > 128) {
      errors.push('displayName must not exceed 128 characters');
    }
  }

  if (body.bio !== undefined && body.bio !== null) {
    if (typeof body.bio !== 'string' || body.bio.length > 2000) {
      errors.push('bio must not exceed 2000 characters');
    }
  }

  if (body.tier !== undefined && !AFFILIATE_TIER_VALUES.includes(body.tier)) {
    errors.push(`tier must be one of: ${AFFILIATE_TIER_VALUES.join(', ')}`);
  }

  if (body.commissionRate !== undefined) {
    if (typeof body.commissionRate !== 'number' || body.commissionRate < 0 || body.commissionRate > 1) {
      errors.push('commissionRate must be between 0 and 1');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateLinkPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!body.name || typeof body.name !== 'string') {
    errors.push('name is required');
  } else if (body.name.length > 128) {
    errors.push('name must not exceed 128 characters');
  }

  if (body.linkType !== undefined && !AFFILIATE_LINK_TYPE_VALUES.includes(body.linkType)) {
    errors.push(`linkType must be one of: ${AFFILIATE_LINK_TYPE_VALUES.join(', ')}`);
  }

  if (body.code !== undefined) {
    if (typeof body.code !== 'string') {
      errors.push('code must be a string');
    } else if (!/^[A-Za-z0-9_-]{4,32}$/.test(body.code)) {
      errors.push('code must be 4 to 32 characters, letters, numbers, hyphens, and underscores');
    }
  }

  if (body.targetUrl !== undefined && body.targetUrl !== null) {
    if (typeof body.targetUrl !== 'string' || body.targetUrl.length > 512) {
      errors.push('targetUrl must not exceed 512 characters');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateAttributionPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!body.code || typeof body.code !== 'string') {
    errors.push('code is required');
  }

  if (body.referredUserId !== undefined && typeof body.referredUserId !== 'string') {
    errors.push('referredUserId must be a string');
  }

  return { valid: errors.length === 0, errors };
}

export function validatePayoutPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (typeof body.amount !== 'number' || body.amount <= 0) {
    errors.push('amount must be a positive number');
  }

  if (body.method !== undefined) {
    const allowed = ['BANK_TRANSFER', 'CRYPTO', 'PAYSTACK', 'STRIPE'];
    if (!allowed.includes(body.method)) {
      errors.push(`method must be one of: ${allowed.join(', ')}`);
    }
  }

  if (body.destination !== undefined && typeof body.destination !== 'object') {
    errors.push('destination must be an object');
  }

  return { valid: errors.length === 0, errors };
}

export function validateCommissionDecisionPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!body.decision || !['APPROVE', 'REJECT', 'REVERSE'].includes(body.decision)) {
    errors.push('decision must be APPROVE, REJECT, or REVERSE');
  }

  if (
    (body.decision === 'REJECT' || body.decision === 'REVERSE') &&
    (!body.reason || typeof body.reason !== 'string')
  ) {
    errors.push('reason is required when rejecting or reversing');
  }

  return { valid: errors.length === 0, errors };
}