/**
 * Wallet Validator
 *
 * Provides validation for wallet operations including ledger entries,
 * withdrawal requests, and balance queries.
 *
 * @module server/modules/wallets/wallet.validator
 */

import { AppError } from '../../lib/errors/app-error';
import { ERROR_CODES } from '../../lib/errors/error-codes';
import { LEDGER_ENTRY_TYPE_VALUES } from '@signalforge/shared/constants/ledger-entry-types';

const MIN_WITHDRAWAL_AMOUNT = 10;
const MAX_WITHDRAWAL_AMOUNT = 1000000;
const MAX_NOTES_LENGTH = 512;
const VALID_CURRENCIES = ['USD', 'EUR', 'GBP', 'NGN'];

export function validateAmount(amount, { min = 0, max = MAX_WITHDRAWAL_AMOUNT, fieldName = 'amount' } = {}) {
  if (amount === undefined || amount === null) {
    throw new AppError(`${fieldName} is required`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const num = Number(amount);

  if (!Number.isFinite(num)) {
    throw new AppError(`${fieldName} must be a number`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (num <= 0) {
    throw new AppError(`${fieldName} must be greater than 0`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (num < min) {
    throw new AppError(`${fieldName} must be at least ${min}`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (num > max) {
    throw new AppError(`${fieldName} must not exceed ${max}`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  return Number(num.toFixed(8));
}

export function validateCurrency(currency) {
  if (!currency || typeof currency !== 'string') {
    throw new AppError('currency is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const upper = currency.trim().toUpperCase();

  if (!VALID_CURRENCIES.includes(upper)) {
    throw new AppError(`currency must be one of: ${VALID_CURRENCIES.join(', ')}`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  return upper;
}

export function validateLedgerEntryType(entryType) {
  if (!entryType || typeof entryType !== 'string') {
    throw new AppError('entryType is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!LEDGER_ENTRY_TYPE_VALUES.includes(entryType)) {
    throw new AppError(`Invalid ledger entry type: ${entryType}`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  return entryType;
}

export function validateWithdrawalPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new AppError('Payload must be an object', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const amount = validateAmount(payload.amount, {
    min: MIN_WITHDRAWAL_AMOUNT,
    fieldName: 'amount',
  });

  const currency = validateCurrency(payload.currency || 'USD');

  const method = payload.method ? String(payload.method).trim().toUpperCase() : null;

  if (!method) {
    throw new AppError('Withdrawal method is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const validMethods = ['BANK_TRANSFER', 'CRYPTO'];

  if (!validMethods.includes(method)) {
    throw new AppError(`Invalid withdrawal method: ${method}`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  let notes = null;
  if (payload.notes !== undefined && payload.notes !== null) {
    if (typeof payload.notes !== 'string') {
      throw new AppError('Notes must be a string', ERROR_CODES.VALIDATION_FAILED, 400);
    }
    if (payload.notes.length > MAX_NOTES_LENGTH) {
      throw new AppError(`Notes exceed ${MAX_NOTES_LENGTH} characters`, ERROR_CODES.VALIDATION_FAILED, 400);
    }
    notes = payload.notes;
  }

  return { amount, currency, method, notes };
}

export function validateLedgerEntryPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new AppError('Payload must be an object', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const amount = validateAmount(payload.amount, { min: 0.00000001, fieldName: 'amount' });
  const currency = validateCurrency(payload.currency || 'USD');
  const entryType = validateLedgerEntryType(payload.entryType);

  return {
    amount,
    currency,
    entryType,
    referenceType: payload.referenceType ? String(payload.referenceType).substring(0, 64) : null,
    referenceId: payload.referenceId ? String(payload.referenceId).substring(0, 128) : null,
    description: payload.description ? String(payload.description).substring(0, 512) : null,
  };
}

export function validateTransferPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new AppError('Payload must be an object', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!payload.toUserId || typeof payload.toUserId !== 'string') {
    throw new AppError('toUserId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const amount = validateAmount(payload.amount, { min: 0.01, fieldName: 'amount' });
  const currency = validateCurrency(payload.currency || 'USD');

  return {
    toUserId: payload.toUserId,
    amount,
    currency,
    notes: payload.notes ? String(payload.notes).substring(0, MAX_NOTES_LENGTH) : null,
  };
}

export const WALLET_VALIDATION_CONSTRAINTS = Object.freeze({
  minWithdrawalAmount: MIN_WITHDRAWAL_AMOUNT,
  maxWithdrawalAmount: MAX_WITHDRAWAL_AMOUNT,
  maxNotesLength: MAX_NOTES_LENGTH,
  validCurrencies: VALID_CURRENCIES,
});