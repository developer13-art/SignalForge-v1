/**
 * Payments Validators
 *
 * @module signalforge/server/modules/payments/validator
 */

import {
  PAYMENT_PROVIDER_VALUES,
  PAYMENT_PURPOSE_VALUES,
} from './payment.constants.js';

export function validateCreatePaymentPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!body.provider || !PAYMENT_PROVIDER_VALUES.includes(body.provider)) {
    errors.push(`provider must be one of: ${PAYMENT_PROVIDER_VALUES.join(', ')}`);
  }

  if (!body.purpose || !PAYMENT_PURPOSE_VALUES.includes(body.purpose)) {
    errors.push(`purpose must be one of: ${PAYMENT_PURPOSE_VALUES.join(', ')}`);
  }

  if (typeof body.amount !== 'number' || body.amount <= 0) {
    errors.push('amount must be a positive number');
  }

  if (body.currency !== undefined) {
    if (typeof body.currency !== 'string' || body.currency.length !== 3) {
      errors.push('currency must be a 3-letter ISO code');
    }
  }

  if (body.referenceId !== undefined && body.referenceId !== null) {
    if (typeof body.referenceId !== 'string' || body.referenceId.length > 128) {
      errors.push('referenceId must not exceed 128 characters');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateRefundPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (body.amount !== undefined && (typeof body.amount !== 'number' || body.amount <= 0)) {
    errors.push('amount must be a positive number');
  }

  if (body.reason !== undefined) {
    if (typeof body.reason !== 'string' || body.reason.length > 512) {
      errors.push('reason must not exceed 512 characters');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateInvoicePayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (typeof body.amount !== 'number' || body.amount <= 0) {
    errors.push('amount must be a positive number');
  }

  if (body.currency !== undefined) {
    if (typeof body.currency !== 'string' || body.currency.length !== 3) {
      errors.push('currency must be a 3-letter ISO code');
    }
  }

  if (body.dueAt !== undefined && body.dueAt !== null) {
    const date = new Date(body.dueAt);
    if (Number.isNaN(date.getTime())) {
      errors.push('dueAt must be a valid date');
    }
  }

  if (body.lineItems !== undefined && !Array.isArray(body.lineItems)) {
    errors.push('lineItems must be an array');
  }

  return { valid: errors.length === 0, errors };
}