'use strict';

const { HYPERLIQUID_ERROR_CODES } = require('./hyperliquid.constants');

/**
 * SignalForge - Hyperliquid Gateway Error Types
 */

class HyperliquidError extends Error {
  constructor(message, code = HYPERLIQUID_ERROR_CODES.INTERNAL_ERROR, statusCode = 500, details = null) {
    super(message);
    this.name = 'HyperliquidError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isHyperliquidError = true;
    Error.captureStackTrace(this, HyperliquidError);
  }

  toResponse() {
    return {
      message: this.message,
      error: {
        code: this.code,
        details: this.details || undefined,
      },
    };
  }
}

class InvalidRequestError extends HyperliquidError {
  constructor(message = 'The Hyperliquid request is invalid', details = null) {
    super(message, HYPERLIQUID_ERROR_CODES.INVALID_REQUEST, 400, details);
    this.name = 'InvalidRequestError';
  }
}

class OrderFailedError extends HyperliquidError {
  constructor(message = 'Hyperliquid order submission failed', details = null) {
    super(message, HYPERLIQUID_ERROR_CODES.ORDER_FAILED, 500, details);
    this.name = 'OrderFailedError';
  }
}

class CancelFailedError extends HyperliquidError {
  constructor(message = 'Hyperliquid cancel failed', details = null) {
    super(message, HYPERLIQUID_ERROR_CODES.CANCEL_FAILED, 500, details);
    this.name = 'CancelFailedError';
  }
}

class ModifyFailedError extends HyperliquidError {
  constructor(message = 'Hyperliquid modify failed', details = null) {
    super(message, HYPERLIQUID_ERROR_CODES.MODIFY_FAILED, 500, details);
    this.name = 'ModifyFailedError';
  }
}

class LeverageFailedError extends HyperliquidError {
  constructor(message = 'Failed to update leverage on Hyperliquid', details = null) {
    super(message, HYPERLIQUID_ERROR_CODES.LEVERAGE_FAILED, 500, details);
    this.name = 'LeverageFailedError';
  }
}

class MarginFailedError extends HyperliquidError {
  constructor(message = 'Failed to update margin on Hyperliquid', details = null) {
    super(message, HYPERLIQUID_ERROR_CODES.MARGIN_FAILED, 500, details);
    this.name = 'MarginFailedError';
  }
}

class MarketNotFoundError extends HyperliquidError {
  constructor(message = 'The requested market was not found on Hyperliquid', details = null) {
    super(message, HYPERLIQUID_ERROR_CODES.MARKET_NOT_FOUND, 404, details);
    this.name = 'MarketNotFoundError';
  }
}

class InsufficientMarginError extends HyperliquidError {
  constructor(message = 'Insufficient margin for the requested order', details = null) {
    super(message, HYPERLIQUID_ERROR_CODES.INSUFFICIENT_MARGIN, 400, details);
    this.name = 'InsufficientMarginError';
  }
}

class PriceOutOfBoundsError extends HyperliquidError {
  constructor(message = 'The requested price is out of bounds', details = null) {
    super(message, HYPERLIQUID_ERROR_CODES.PRICE_OUT_OF_BOUNDS, 400, details);
    this.name = 'PriceOutOfBoundsError';
  }
}

class SizeOutOfBoundsError extends HyperliquidError {
  constructor(message = 'The requested size is out of bounds', details = null) {
    super(message, HYPERLIQUID_ERROR_CODES.SIZE_OUT_OF_BOUNDS, 400, details);
    this.name = 'SizeOutOfBoundsError';
  }
}

class SignerUnavailableError extends HyperliquidError {
  constructor(message = 'The Hyperliquid signer is unavailable', details = null) {
    super(message, HYPERLIQUID_ERROR_CODES.SIGNER_UNAVAILABLE, 503, details);
    this.name = 'SignerUnavailableError';
  }
}

class RateLimitedError extends HyperliquidError {
  constructor(message = 'Hyperliquid rate limit was exceeded', details = null) {
    super(message, HYPERLIQUID_ERROR_CODES.RATE_LIMITED, 429, details);
    this.name = 'RateLimitedError';
  }
}

class ServiceUnavailableError extends HyperliquidError {
  constructor(message = 'Hyperliquid is temporarily unavailable', details = null) {
    super(message, HYPERLIQUID_ERROR_CODES.SERVICE_UNAVAILABLE, 503, details);
    this.name = 'ServiceUnavailableError';
  }
}

class ConfirmationTimeoutError extends HyperliquidError {
  constructor(message = 'Hyperliquid confirmation timed out', details = null) {
    super(message, HYPERLIQUID_ERROR_CODES.CONFIRMATION_TIMEOUT, 408, details);
    this.name = 'ConfirmationTimeoutError';
  }
}

function isHyperliquidError(error) {
  return Boolean(error && error.isHyperliquidError === true);
}

function toHyperliquidResponse(error) {
  if (isHyperliquidError(error)) {
    return {
      statusCode: error.statusCode,
      body: error.toResponse(),
    };
  }
  return {
    statusCode: 500,
    body: {
      message: 'An unexpected error occurred in the Hyperliquid gateway',
      error: { code: HYPERLIQUID_ERROR_CODES.INTERNAL_ERROR },
    },
  };
}

module.exports = {
  HyperliquidError,
  InvalidRequestError,
  OrderFailedError,
  CancelFailedError,
  ModifyFailedError,
  LeverageFailedError,
  MarginFailedError,
  MarketNotFoundError,
  InsufficientMarginError,
  PriceOutOfBoundsError,
  SizeOutOfBoundsError,
  SignerUnavailableError,
  RateLimitedError,
  ServiceUnavailableError,
  ConfirmationTimeoutError,
  isHyperliquidError,
  toHyperliquidResponse,
};