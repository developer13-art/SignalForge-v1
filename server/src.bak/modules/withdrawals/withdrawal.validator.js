/**
 * Withdrawal Validators
 *
 * @module signalforge/server/modules/withdrawals/validator
 */

import {
  WITHDRAWAL_METHOD_TYPE_VALUES,
  WITHDRAWAL_PURPOSE_VALUES,
} from './withdrawal.constants.js';

export function validateCreateAccountPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!body.methodType || !WITHDRAWAL_METHOD_TYPE_VALUES.includes(body.methodType)) {
    errors.push(`methodType must be one of: ${WITHDRAWAL_METHOD_TYPE_VALUES.join(', ')}`);
  }

  if (!body.details || typeof body.details !== 'object') {
    errors.push('details is required');
    return { valid: false, errors };
  }

  if (body.methodType === 'BANK_TRANSFER') {
    if (!body.details.accountNumber || typeof body.details.accountNumber !== 'string') {
      errors.push('details.accountNumber is required for bank transfers');
    }
    if (!body.details.bankName || typeof body.details.bankName !== 'string') {
      errors.push('details.bankName is required for bank transfers');
    }
    if (!body.details.accountName || typeof body.details.accountName !== 'string') {
      errors.push('details.accountName is required for bank transfers');
    }
    if (body.details.accountNumber && !/^\d{6,20}$/.test(body.details.accountNumber)) {
      errors.push('details.accountNumber must be 6 to 20 digits');
    }
  }

  if (body.methodType === 'CRYPTO') {
    if (!body.details.walletAddress || typeof body.details.walletAddress !== 'string') {
      errors.push('details.walletAddress is required for crypto withdrawals');
    }
    if (!body.details.network || typeof body.details.network !== 'string') {
      errors.push('details.network is required for crypto withdrawals');
    }
  }

  if (body.label !== undefined) {
    if (typeof body.label !== 'string' || body.label.length > 128) {
      errors.push('label must not exceed 128 characters');
    }
  }

  if (body.isDefault !== undefined && typeof body.isDefault !== 'boolean') {
    errors.push('isDefault must be a boolean');
  }

  return { valid: errors.length === 0, errors };
}

export function validateWithdrawalRequestPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!body.accountId || typeof body.accountId !== 'string') {
    errors.push('accountId is required');
  }

  if (!body.purpose || !WITHDRAWAL_PURPOSE_VALUES.includes(body.purpose)) {
    errors.push(`purpose must be one of: ${WITHDRAWAL_PURPOSE_VALUES.join(', ')}`);
  }

  if (typeof body.amount !== 'number' || body.amount <= 0) {
    errors.push('amount must be a positive number');
  }

  if (body.currency !== undefined) {
    if (typeof body.currency !== 'string' || body.currency.length !== 3) {
      errors.push('currency must be a 3-letter ISO code');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateDecisionPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!body.decision || !['APPROVE', 'REJECT'].includes(body.decision)) {
    errors.push('decision must be APPROVE or REJECT');
  }

  if (body.decision === 'REJECT' && (!body.reason || typeof body.reason !== 'string')) {
    errors.push('reason is required when rejecting');
  }

  if (body.reason !== undefined) {
    if (typeof body.reason !== 'string' || body.reason.length > 1024) {
      errors.push('reason must not exceed 1024 characters');
    }
  }

  return { valid: errors.length === 0, errors };
}