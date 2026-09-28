'use strict';

const { ORCA_ERROR_CODES } = require('./orca.constants');

/**
 * SignalForge - Orca Gateway Error Types
 */

class OrcaError extends Error {
  constructor(message, code = ORCA_ERROR_CODES.INTERNAL_ERROR, statusCode = 500, details = null) {
    super(message);
    this.name = 'OrcaError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isOrcaError = true;
    Error.captureStackTrace(this, OrcaError);
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

class InvalidRequestError extends OrcaError {
  constructor(message = 'The Orca request is invalid', details = null) {
    super(message, ORCA_ERROR_CODES.INVALID_REQUEST, 400, details);
    this.name = 'InvalidRequestError';
  }
}

class QuoteFailedError extends OrcaError {
  constructor(message = 'Failed to fetch an Orca quote', details = null) {
    super(message, ORCA_ERROR_CODES.QUOTE_FAILED, 500, details);
    this.name = 'QuoteFailedError';
  }
}

class SwapFailedError extends OrcaError {
  constructor(message = 'Failed to build the Orca swap', details = null) {
    super(message, ORCA_ERROR_CODES.SWAP_FAILED, 500, details);
    this.name = 'SwapFailedError';
  }
}

class PoolNotFoundError extends OrcaError {
  constructor(message = 'The requested Orca pool was not found', details = null) {
    super(message, ORCA_ERROR_CODES.POOL_NOT_FOUND, 404, details);
    this.name = 'PoolNotFoundError';
  }
}

class TokenNotFoundError extends OrcaError {
  constructor(message = 'The token is not supported by Orca', details = null) {
    super(message, ORCA_ERROR_CODES.TOKEN_NOT_FOUND, 400, details);
    this.name = 'TokenNotFoundError';
  }
}

class NoRouteFoundError extends OrcaError {
  constructor(message = 'No route was found for the requested swap', details = null) {
    super(message, ORCA_ERROR_CODES.NO_ROUTE_FOUND, 400, details);
    this.name = 'NoRouteFoundError';
  }
}

class SlippageExceededError extends OrcaError {
  constructor(message = 'The slippage tolerance was exceeded', details = null) {
    super(message, ORCA_ERROR_CODES.SLIPPAGE_EXCEEDED, 400, details);
    this.name = 'SlippageExceededError';
  }
}

class PriceImpactExceededError extends OrcaError {
  constructor(message = 'The price impact exceeds the allowed threshold', details = null) {
    super(message, ORCA_ERROR_CODES.PRICE_IMPACT_EXCEEDED, 400, details);
    this.name = 'PriceImpactExceededError';
  }
}

class TransactionFailedError extends OrcaError {
  constructor(message = 'The Orca transaction failed', details = null) {
    super(message, ORCA_ERROR_CODES.TRANSACTION_FAILED, 500, details);
    this.name = 'TransactionFailedError';
  }
}

class ConfirmationTimeoutError extends OrcaError {
  constructor(message = 'The Orca transaction confirmation timed out', details = null) {
    super(message, ORCA_ERROR_CODES.CONFIRMATION_TIMEOUT, 408, details);
    this.name = 'ConfirmationTimeoutError';
  }
}

class RateLimitedError extends OrcaError {
  constructor(message = 'Orca rate limit was exceeded', details = null) {
    super(message, ORCA_ERROR_CODES.RATE_LIMITED, 429, details);
    this.name = 'RateLimitedError';
  }
}

class ServiceUnavailableError extends OrcaError {
  constructor(message = 'The Orca gateway is temporarily unavailable', details = null) {
    super(message, ORCA_ERROR_CODES.SERVICE_UNAVAILABLE, 503, details);
    this.name = 'ServiceUnavailableError';
  }
}

function isOrcaError(error) {
  return Boolean(error && error.isOrcaError === true);
}

function toOrcaResponse(error) {
  if (isOrcaError(error)) {
    return {
      statusCode: error.statusCode,
      body: error.toResponse(),
    };
  }
  return {
    statusCode: 500,
    body: {
      message: 'An unexpected error occurred in the Orca gateway',
      error: { code: ORCA_ERROR_CODES.INTERNAL_ERROR },
    },
  };
}

module.exports = {
  OrcaError,
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
  isOrcaError,
  toOrcaResponse,
};