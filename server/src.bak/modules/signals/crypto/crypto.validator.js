'use strict';

const {
  CRYPTO_MAX_SYMBOL_LENGTH,
  CRYPTO_DEFAULT_CONFIDENCE_THRESHOLD,
} = require('./crypto.constants');

const {
  InvalidSymbolError,
  InvalidPriceError,
  InvalidAmountError,
  InvalidDirectionError,
} = require('./crypto.errors');

/**
 * SignalForge - Crypto Signals Validator
 *
 * Validates crypto signal payloads before they enter the pipeline.
 * The validator is used by both the API layer and the pipeline itself
 * so that rule enforcement is uniform.
 */

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function validateSymbol(symbol) {
  if (!isNonEmptyString(symbol)) {
    throw new InvalidSymbolError('symbol is required');
  }
  const trimmed = symbol.trim();
  if (trimmed.length > CRYPTO_MAX_SYMBOL_LENGTH) {
    throw new InvalidSymbolError(
      `symbol must not exceed ${CRYPTO_MAX_SYMBOL_LENGTH} characters`,
      { length: trimmed.length, max: CRYPTO_MAX_SYMBOL_LENGTH },
    );
  }
  return trimmed.toUpperCase();
}

function validateDirection(direction) {
  if (direction === undefined || direction === null || direction === '') {
    return null;
  }
  const normalized = String(direction).trim().toUpperCase();
  if (!['BUY', 'SELL', 'LONG', 'SHORT'].includes(normalized)) {
    throw new InvalidDirectionError(`Unsupported direction: ${direction}`, { direction });
  }
  return normalized;
}

function validatePositiveNumber(value, { field, allowZero = false } = {}) {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    throw new InvalidPriceError(`${field} must be a finite number`, { [field]: value });
  }
  if (!allowZero && numeric <= 0) {
    throw new InvalidPriceError(`${field} must be greater than zero`, { [field]: value });
  }
  if (numeric < 0) {
    throw new InvalidPriceError(`${field} must not be negative`, { [field]: value });
  }
  return numeric;
}

function validateConfidence(confidence) {
  if (confidence === undefined || confidence === null || confidence === '') {
    return CRYPTO_DEFAULT_CONFIDENCE_THRESHOLD;
  }
  const numeric = Number(confidence);
  if (!Number.isFinite(numeric)) {
    return CRYPTO_DEFAULT_CONFIDENCE_THRESHOLD;
  }
  if (numeric > 1) {
    return Math.min(1, numeric / 100);
  }
  return Math.max(0, Math.min(1, numeric));
}

function validateAmount(amount, { allowZero = false } = {}) {
  if (amount === undefined || amount === null || amount === '') {
    return null;
  }
  const numeric = Number(amount);
  if (!Number.isFinite(numeric)) {
    throw new InvalidAmountError('amount must be a finite number', { amount });
  }
  if (!allowZero && numeric <= 0) {
    throw new InvalidAmountError('amount must be greater than zero', { amount });
  }
  return numeric;
}

function validateSignalPayload(payload) {
  if (!isPlainObject(payload)) {
    throw new InvalidSymbolError('payload must be a JSON object');
  }

  const result = {
    symbol: validateSymbol(payload.symbol),
    direction: validateDirection(payload.direction),
    orderType: payload.orderType || payload.entryType || 'market',
    entryPrice: validatePositiveNumber(payload.entryPrice, { field: 'entryPrice' }),
    stopLoss: validatePositiveNumber(payload.stopLoss, { field: 'stopLoss' }),
    amount: validateAmount(payload.amount),
    confidence: validateConfidence(payload.confidence),
  };

  if (payload.takeProfits !== undefined) {
    if (Array.isArray(payload.takeProfits)) {
      result.takeProfits = payload.takeProfits
        .map((value) => {
          try {
            return validatePositiveNumber(value, { field: 'takeProfit' });
          } catch (_error) {
            return null;
          }
        })
        .filter((value) => value !== null);
    } else {
      result.takeProfits = [
        validatePositiveNumber(payload.takeProfits, { field: 'takeProfit' }),
      ].filter((value) => value !== null);
    }
  }

  if (payload.timeframe !== undefined) {
    result.timeframe = payload.timeframe ? String(payload.timeframe).trim() : null;
  }

  if (payload.rawText !== undefined) {
    result.rawText = payload.rawText ? String(payload.rawText).slice(0, 4000) : null;
  }

  return result;
}

function validateBatchPayload(items) {
  if (!Array.isArray(items)) {
    throw new InvalidSymbolError('items must be an array');
  }
  if (items.length === 0) {
    throw new InvalidSymbolError('items must not be empty');
  }
  if (items.length > 100) {
    throw new InvalidSymbolError('items must not exceed 100 entries');
  }

  const results = [];
  for (const item of items) {
    try {
      results.push({ valid: true, payload: validateSignalPayload(item) });
    } catch (error) {
      results.push({
        valid: false,
        error: error.message,
        code: error.code || 'CRYPTO_INVALID_SYMBOL',
      });
    }
  }
  return results;
}

module.exports = {
  isNonEmptyString,
  isPlainObject,
  validateSymbol,
  validateDirection,
  validatePositiveNumber,
  validateConfidence,
  validateAmount,
  validateSignalPayload,
  validateBatchPayload,
};