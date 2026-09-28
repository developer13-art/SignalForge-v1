/**
 * Referral Validators
 *
 * @module signalforge/server/modules/referrals/validator
 */

const PERIOD_PATTERN = /^\d{4}-\d{2}$/;

export function validateCreateCodePayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (body.code !== undefined) {
    if (typeof body.code !== 'string') {
      errors.push('code must be a string');
    } else if (body.code.length < 4 || body.code.length > 32) {
      errors.push('code must be between 4 and 32 characters');
    } else if (!/^[a-zA-Z0-9_-]+$/.test(body.code)) {
      errors.push('code may only contain letters, numbers, hyphens, and underscores');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateRelationshipPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!body.referralCode || typeof body.referralCode !== 'string') {
    errors.push('referralCode is required');
  } else if (body.referralCode.length < 4 || body.referralCode.length > 32) {
    errors.push('referralCode must be between 4 and 32 characters');
  }

  if (body.attributionSource !== undefined) {
    if (typeof body.attributionSource !== 'string' || body.attributionSource.length > 64) {
      errors.push('attributionSource must not exceed 64 characters');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateSettlementPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!body.settlementPeriod || typeof body.settlementPeriod !== 'string') {
    errors.push('settlementPeriod is required');
  } else if (!PERIOD_PATTERN.test(body.settlementPeriod)) {
    errors.push('settlementPeriod must be in YYYY-MM format');
  }

  if (body.freezeHours !== undefined) {
    if (typeof body.freezeHours !== 'number' || body.freezeHours < 0 || body.freezeHours > 168) {
      errors.push('freezeHours must be between 0 and 168');
    }
  }

  if (body.force !== undefined && typeof body.force !== 'boolean') {
    errors.push('force must be a boolean');
  }

  return { valid: errors.length === 0, errors };
}

export function validateRewardDecisionPayload(body) {
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

  if (body.reason !== undefined) {
    if (typeof body.reason !== 'string' || body.reason.length > 1024) {
      errors.push('reason must not exceed 1024 characters');
    }
  }

  return { valid: errors.length === 0, errors };
}