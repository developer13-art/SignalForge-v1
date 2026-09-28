'use strict';

const { RAYDIUM_ERROR_CODES } = require('./raydium.constants');

/**
 * SignalForge - Raydium Gateway Error Types
 */

class RaydiumError extends Error {
  constructor(message, code = RAYDIUM_ERROR_CODES.INTERNAL_ERROR, statusCode = 500, details = null) {
    super(message);
    this.name = 'RaydiumError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isRaydiumError = true;
    Error.captureStackTrace(this, RaydiumError);
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

class InvalidRequestError extends RaydiumError {
  constructor(message = 'The Raydium request is invalid', details = null) {
    super(message, RAYDIUM_ERROR_CODES.INVALID_REQUEST, 400, details);
    this.name = 'InvalidRequestError';
  }
}

class QuoteFailedError extends RaydiumError {
  constructor(message = 'Failed to fetch a Raydium quote', details = null) {
    super(message, RAYDIUM_ERROR_CODES.QUOTE_FAILED, 500, details);
    this.name = 'QuoteFailedError';
  }
}

class SwapFailedError extends RaydiumError {
  constructor(message = 'Failed to build the Raydium swap', details = null) {
    super(message, RAYDIUM_ERROR_CODES.SWAP_FAILED, 500, details);
    this.name = 'SwapFailedError';
  }
}

class PoolNotFoundError extends RaydiumError {
  constructor(message = 'The requested Raydium pool was not found', details = null) {
    super(message, RAYDIUM_ERROR_CODES.POOL_NOT_FOUND, 404, details);
    this.name = 'PoolNotFoundError';
  }
}

class TokenNotFoundError extends RaydiumError {
  constructor(message = 'The token is not supported by Raydium', details = null) {
    super(message, RAYDIUM_ERROR_CODES.TOKEN_NOT_FOUND, 400, details);
    this.name = 'TokenNotFoundError';
  }
}

class NoRouteFoundError extends RaydiumError {
  constructor(message = 'No route was found for the requested swap', details = null) {
    super(message, RAYDIUM_ERROR_CODES.NO_ROUTE_FOUND, 400, details);
    this.name = 'NoRouteFoundError';
  }
}

class SlippageExceededError extends RaydiumError {
  constructor(message = 'The slippage tolerance was exceeded', details = null) {
    super(message, RAYDIUM_ERROR_CODES.SLIPPAGE_EXCEEDED, 400, details);
    this.name = 'SlippageExceededError';
  }
}

class PriceImpactExceededError extends RaydiumError {
  constructor(message = 'The price impact exceeds the allowed threshold', details = null) {
    super(message, RAYDIUM_ERROR_CODES.PRICE_IMPACT_EXCEEDED, 400, details);
    this.name = 'PriceImpactExceededError';
  }
}

class TransactionFailedError extends RaydiumError {
  constructor(message = 'The Raydium transaction failed', details = null) {
    super(message, RAYDIUM_ERROR_CODES.TRANSACTION_FAILED, 500, details);
    this.name = 'TransactionFailedError';
  }
}

class ConfirmationTimeoutError extends RaydiumError {
  constructor(message = 'The Raydium transaction confirmation timed out', details = null) {
    super(message, RAYDIUM_ERROR_CODES.CONFIRMATION_TIMEOUT, 408, details);
    this.name = 'ConfirmationTimeoutError';
  }
}

class RateLimitedError extends RaydiumError {
  constructor(message = 'Raydium rate limit was exceeded', details = null) {
    super(message, RAYDIUM_ERROR_CODES.RATE_LIMITED, 429, details);
    this.name = 'RateLimitedError';
  }
}

class ServiceUnavailableError extends RaydiumError {
  constructor(message = 'The Raydium gateway is temporarily unavailable', details = null) {
    super(message, RAYDIUM_ERROR_CODES.SERVICE_UNAVAILABLE, 503, details);
    this.name = 'ServiceUnavailableError';
  }
}

function isRaydiumError(error) {
  return Boolean(error && error.isRaydiumError === true);
}

function toRaydiumResponse(error) {
  if (isRaydiumError(error)) {
    return {
      statusCode: error.statusCode,
      body: error.toResponse(),
    };
  }
  return {
    statusCode: 500,
    body: {
      message: 'An unexpected error occurred in the Raydium gateway',
      error: { code: RAYDIUM_ERROR_CODES.INTERNAL_ERROR },
    },
  };
}

module.exports = {
  RaydiumError,
  InvalidRequestError,
  QuoteFailedError,
  SwapFailedError,
  PoolNotFoundError,
  TokenNotFoundError,
  NoRouteFoundError,
  SlippageExceededError,
  PriceImpactExceededError,
  TransactionFailedError,
  ConfirmationTimeoutError,
  RateLimitedError,
  ServiceUnavailableError,
  isRaydiumError,
  toRaydiumResponse,
};