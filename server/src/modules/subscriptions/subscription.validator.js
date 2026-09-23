/**
 * Subscription Validators
 *
 * @module signalforge/server/modules/subscriptions/validator
 */

import {
  BILLING_INTERVAL_VALUES,
  PLAN_CODE_VALUES,
} from './subscription.constants.js';

export function validatePlanCreatePayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!body.code || !PLAN_CODE_VALUES.includes(body.code)) {
    errors.push(`code must be one of: ${PLAN_CODE_VALUES.join(', ')}`);
  }

  if (!body.name || typeof body.name !== 'string') {
    errors.push('name is required');
  } else if (body.name.length > 128) {
    errors.push('name must not exceed 128 characters');
  }

  if (typeof body.price !== 'number' || body.price < 0) {
    errors.push('price must be a non-negative number');
  }

  if (!body.billingInterval || !BILLING_INTERVAL_VALUES.includes(body.billingInterval)) {
    errors.push(`billingInterval must be one of: ${BILLING_INTERVAL_VALUES.join(', ')}`);
  }

  if (body.currency !== undefined && (typeof body.currency !== 'string' || body.currency.length !== 3)) {
    errors.push('currency must be a 3-letter ISO code');
  }

  if (body.trialDays !== undefined) {
    if (typeof body.trialDays !== 'number' || body.trialDays < 0 || body.trialDays > 90) {
      errors.push('trialDays must be between 0 and 90');
    }
  }

  if (body.features !== undefined && typeof body.features !== 'object') {
    errors.push('features must be an object');
  }

  if (body.limits !== undefined && typeof body.limits !== 'object') {
    errors.push('limits must be an object');
  }

  return { valid: errors.length === 0, errors };
}

export function validatePlanUpdatePayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || body.name.length > 128) {
      errors.push('name must not exceed 128 characters');
    }
  }

  if (body.price !== undefined) {
    if (typeof body.price !== 'number' || body.price < 0) {
      errors.push('price must be a non-negative number');
    }
  }

  if (body.billingInterval !== undefined && !BILLING_INTERVAL_VALUES.includes(body.billingInterval)) {
    errors.push(`billingInterval must be one of: ${BILLING_INTERVAL_VALUES.join(', ')}`);
  }

  if (body.trialDays !== undefined) {
    if (typeof body.trialDays !== 'number' || body.trialDays < 0 || body.trialDays > 90) {
      errors.push('trialDays must be between 0 and 90');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateSubscribePayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!body.planCode || !PLAN_CODE_VALUES.includes(body.planCode)) {
    errors.push(`planCode must be one of: ${PLAN_CODE_VALUES.join(', ')}`);
  }

  if (body.paymentProvider !== undefined) {
    const allowed = ['STRIPE', 'PAYSTACK', 'FLUTTERWAVE', 'SOLANA'];
    if (!allowed.includes(body.paymentProvider)) {
      errors.push(`paymentProvider must be one of: ${allowed.join(', ')}`);
    }
  }

  if (body.useTrial !== undefined && typeof body.useTrial !== 'boolean') {
    errors.push('useTrial must be a boolean');
  }

  return { valid: errors.length === 0, errors };
}

export function validateCancelPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (body.reason !== undefined) {
    if (typeof body.reason !== 'string' || body.reason.length > 512) {
      errors.push('reason must not exceed 512 characters');
    }
  }

  if (body.immediate !== undefined && typeof body.immediate !== 'boolean') {
    errors.push('immediate must be a boolean');
  }

  return { valid: errors.length === 0, errors };
}

export function validateUpgradePayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!body.planCode || !PLAN_CODE_VALUES.includes(body.planCode)) {
    errors.push(`planCode must be one of: ${PLAN_CODE_VALUES.join(', ')}`);
  }

  return { valid: errors.length === 0, errors };
}