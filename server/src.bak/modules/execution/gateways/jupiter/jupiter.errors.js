'use strict';

const { JUPITER_ERROR_CODES } = require('./jupiter.constants');

/**
 * SignalForge - Jupiter Gateway Error Types
 */

class JupiterError extends Error {
  constructor(message, code = JUPITER_ERROR_CODES.INTERNAL_ERROR, statusCode = 500, details = null) {
    super(message);
    this.name = 'JupiterError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isJupiterError = true;
    Error.captureStackTrace(this, JupiterError);
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

class InvalidRequestError extends JupiterError {
  constructor(message = 'The Jupiter request is invalid', details = null) {
    super(message, JUPITER_ERROR_CODES.INVALID_REQUEST, 400, details);
    this.name = 'InvalidRequestError';
  }
}

class QuoteFailedError extends JupiterError {
  constructor(message = 'Failed to fetch a Jupiter quote', details = null) {
    super(message, JUPITER_ERROR_CODES.QUOTE_FAILED, 500, details);
    this.name = 'QuoteFailedError';
  }
}

class SwapFailedError extends JupiterError {
  constructor(message = 'Failed to build the Jupiter swap', details = null) {
    super(message, JUPITER_ERROR_CODES.SWAP_FAILED, 500, details);
    this.name = 'SwapFailedError';
  }
}

class TokenNotFoundError extends JupiterError {
  constructor(message = 'The token is not supported by Jupiter', details = null) {
    super(message, JUPITER_ERROR_CODES.TOKEN_NOT_FOUND, 400, details);
    this.name = 'TokenNotFoundError';
  }
}

class NoRouteFoundError extends JupiterError {
  constructor(message = 'No route was found for the requested swap', details = null) {
    super(message, JUPITER_ERROR_CODES.NO_ROUTE_FOUND, 400, details);
    this.name = 'NoRouteFoundError';
  }
}

class SlippageExceededError extends JupiterError {
  constructor(message = 'The slippage tolerance was exceeded', details = null) {
    super(message, JUPITER_ERROR_CODES.SLIPPAGE_EXCEEDED, 400, details);
    this.name = 'SlippageExceededError';
  }
}

class PriceImpactExceededError extends JupiterError {
  constructor(message = 'The price impact exceeds the allowed threshold', details = null) {
    super(message, JUPITER_ERROR_CODES.PRICE_IMPACT_EXCEEDED, 400, details);
    this.name = 'PriceImpactExceededError';
  }
}

class InsufficientBalanceError extends JupiterError {
  constructor(message = 'Insufficient balance for the requested swap', details = null) {
    super(message, JUPITER_ERROR_CODES.INSUFFICIENT_BALANCE, 400, details);
    this.name = 'InsufficientBalanceError';
  }
}

class TransactionFailedError extends JupiterError {
  constructor(message = 'The Jupiter transaction failed', details = null) {
    super(message, JUPITER_ERROR_CODES.TRANSACTION_FAILED, 500, details);
    this.name = 'TransactionFailedError';
  }
}

class ConfirmationTimeoutError extends JupiterError {
  constructor(message = 'The Jupiter transaction confirmation timed out', details = null) {
    super(message, JUPITER_ERROR_CODES.CONFIRMATION_TIMEOUT, 408, details);
    this.name = 'ConfirmationTimeoutError';
  }
}

class RateLimitedError extends JupiterError {
  constructor(message = 'Jupiter rate limit was exceeded', details = null) {
    super(message, JUPITER_ERROR_CODES.RATE_LIMITED, 429, details);
    this.name = 'RateLimitedError';
  }
}

class ServiceUnavailableError extends JupiterError {
  constructor(message = 'The Jupiter gateway is temporarily unavailable', details = null) {
    super(message, JUPITER_ERROR_CODES.SERVICE_UNAVAILABLE, 503, details);
    this.name = 'ServiceUnavailableError';
  }
}

function isJupiterError(error) {
  return Boolean(error && error.isJupiterError === true);
}

function toJupiterResponse(error) {
  if (isJupiterError(error)) {
    return {
      statusCode: error.statusCode,
      body: error.toResponse(),
    };
  }
  return {
    statusCode: 500,
    body: {
      message: 'An unexpected error occurred in the Jupiter gateway',
      error: { code: JUPITER_ERROR_CODES.INTERNAL_ERROR },
    },
  };
}

module.exports = {
  JupiterError,
  InvalidRequestError,
  QuoteFailedError,
  SwapFailedError,
  TokenNotFoundError,
  NoRouteFoundError,
  SlippageExceededError,
  PriceImpactExceededError,
  InsufficientBalanceError,
  TransactionFailedError,
  ConfirmationTimeoutError,
  RateLimitedError,
  ServiceUnavailableError,
  isJupiterError,
  toJupiterResponse,
};