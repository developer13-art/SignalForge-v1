/**
 * Provider Validators
 *
 * @module signalforge/server/modules/providers/validator
 */

import {
  PROVIDER_TYPE_VALUES,
  PROVIDER_VISIBILITY_VALUES,
  PROMOTION_TYPE_VALUES,
} from './provider.constants.js';

export function validateProviderRegistrationPayload(body) {
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

  if (body.providerType !== undefined && !PROVIDER_TYPE_VALUES.includes(body.providerType)) {
    errors.push(`providerType must be one of: ${PROVIDER_TYPE_VALUES.join(', ')}`);
  }

  if (body.visibility !== undefined && !PROVIDER_VISIBILITY_VALUES.includes(body.visibility)) {
    errors.push(`visibility must be one of: ${PROVIDER_VISIBILITY_VALUES.join(', ')}`);
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
  } else if (Array.isArray(body.tags)) {
    for (const tag of body.tags) {
      if (typeof tag !== 'string' || tag.length > 32) {
        errors.push('each tag must be a string of at most 32 characters');
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateProviderUpdatePayload(body) {
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

  if (body.providerType !== undefined && !PROVIDER_TYPE_VALUES.includes(body.providerType)) {
    errors.push(`providerType must be one of: ${PROVIDER_TYPE_VALUES.join(', ')}`);
  }

  if (body.visibility !== undefined && !PROVIDER_VISIBILITY_VALUES.includes(body.visibility)) {
    errors.push(`visibility must be one of: ${PROVIDER_VISIBILITY_VALUES.join(', ')}`);
  }

  if (body.tags !== undefined && !Array.isArray(body.tags)) {
    errors.push('tags must be an array');
  }

  return { valid: errors.length === 0, errors };
}

export function validateCertificationStartPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (body.historicalMessageLimit !== undefined) {
    if (
      typeof body.historicalMessageLimit !== 'number' ||
      body.historicalMessageLimit < 100 ||
      body.historicalMessageLimit > 10000
    ) {
      errors.push('historicalMessageLimit must be between 100 and 10000');
    }
  }

  if (body.sourceIds !== undefined && !Array.isArray(body.sourceIds)) {
    errors.push('sourceIds must be an array');
  }

  if (body.version !== undefined) {
    if (typeof body.version !== 'string' || body.version.length > 32) {
      errors.push('version must not exceed 32 characters');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validatePromotionPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!body.name || typeof body.name !== 'string') {
    errors.push('name is required');
  } else if (body.name.length > 128) {
    errors.push('name must not exceed 128 characters');
  }

  if (!body.promotionType || !PROMOTION_TYPE_VALUES.includes(body.promotionType)) {
    errors.push(`promotionType must be one of: ${PROMOTION_TYPE_VALUES.join(', ')}`);
  }

  if (body.value !== undefined) {
    if (typeof body.value !== 'number' || body.value <= 0) {
      errors.push('value must be a positive number');
    }
  }

  if (body.maxUses !== undefined) {
    if (typeof body.maxUses !== 'number' || body.maxUses < 0) {
      errors.push('maxUses must be a non-negative number');
    }
  }

  if (body.startsAt !== undefined && body.startsAt !== null) {
    const date = new Date(body.startsAt);
    if (Number.isNaN(date.getTime())) {
      errors.push('startsAt must be a valid date');
    }
  }

  if (body.endsAt !== undefined && body.endsAt !== null) {
    const date = new Date(body.endsAt);
    if (Number.isNaN(date.getTime())) {
      errors.push('endsAt must be a valid date');
    }
  }

  if (body.targetPlans !== undefined && !Array.isArray(body.targetPlans)) {
    errors.push('targetPlans must be an array');
  }

  return { valid: errors.length === 0, errors };
}

export function validateCertificationDecisionPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!body.decision || !['APPROVE', 'REJECT', 'REVOKE'].includes(body.decision)) {
    errors.push('decision must be APPROVE, REJECT, or REVOKE');
  }

  if (
    (body.decision === 'REJECT' || body.decision === 'REVOKE') &&
    (!body.reason || typeof body.reason !== 'string')
  ) {
    errors.push('reason is required when rejecting or revoking');
  }

  return { valid: errors.length === 0, errors };
}