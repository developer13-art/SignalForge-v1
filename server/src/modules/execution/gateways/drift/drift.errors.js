'use strict';

const { DRIFT_ERROR_CODES } = require('./drift.constants');

/**
 * SignalForge - Drift Gateway Error Types
 */

class DriftError extends Error {
  constructor(message, code = DRIFT_ERROR_CODES.INTERNAL_ERROR, statusCode = 500, details = null) {
    super(message);
    this.name = 'DriftError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isDriftError = true;
    Error.captureStackTrace(this, DriftError);
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

class InvalidRequestError extends DriftError {
  constructor(message = 'The Drift request is invalid', details = null) {
    super(message, DRIFT_ERROR_CODES.INVALID_REQUEST, 400, details);
    this.name = 'InvalidRequestError';
  }
}

class OrderFailedError extends DriftError {
  constructor(message = 'Drift order submission failed', details = null) {
    super(message, DRIFT_ERROR_CODES.ORDER_FAILED, 500, details);
    this.name = 'OrderFailedError';
  }
}

class CancelFailedError extends DriftError {
  constructor(message = 'Drift cancel failed', details = null) {
    super(message, DRIFT_ERROR_CODES.CANCEL_FAILED, 500, details);
    this.name = 'CancelFailedError';
  }
}

class ModifyFailedError extends DriftError {
  constructor(message = 'Drift modify failed', details = null) {
    super(message, DRIFT_ERROR_CODES.MODIFY_FAILED, 500, details);
    this.name = 'ModifyFailedError';
  }
}

class LeverageFailedError extends DriftError {
  constructor(message = 'Failed to update leverage on Drift', details = null) {
    super(message, DRIFT_ERROR_CODES.LEVERAGE_FAILED, 500, details);
    this.name = 'LeverageFailedError';
  }
}

class MarginFailedError extends DriftError {
  constructor(message = 'Failed to update margin on Drift', details = null) {
    super(message, DRIFT_ERROR_CODES.MARGIN_FAILED, 500, details);
    this.name = 'MarginFailedError';
  }
}

class MarketNotFoundError extends DriftError {
  constructor(message = 'The requested market was not found on Drift', details = null) {
    super(message, DRIFT_ERROR_CODES.MARKET_NOT_FOUND, 404, details);
    this.name = 'MarketNotFoundError';
  }
}

class InsufficientMarginError extends DriftError {
  constructor(message = 'Insufficient margin for the requested order', details = null) {
    super(message, DRIFT_ERROR_CODES.INSUFFICIENT_MARGIN, 400, details);
    this.name = 'InsufficientMarginError';
  }
}

class PriceOutOfBoundsError extends DriftError {
  constructor(message = 'The requested price is out of bounds', details = null) {
    super(message, DRIFT_ERROR_CODES.PRICE_OUT_OF_BOUNDS, 400, details);
    this.name = 'PriceOutOfBoundsError';
  }
}

class SizeOutOfBoundsError extends DriftError {
  constructor(message = 'The requested size is out of bounds', details = null) {
    super(message, DRIFT_ERROR_CODES.SIZE_OUT_OF_BOUNDS, 400, details);
    this.name = 'SizeOutOfBoundsError';
  }
}

class SignerUnavailableError extends DriftError {
  constructor(message = 'The Drift signer is unavailable', details = null) {
    super(message, DRIFT_ERROR_CODES.SIGNER_UNAVAILABLE, 503, details);
    this.name = 'SignerUnavailableError';
  }
}

class RateLimitedError extends DriftError {
  constructor(message = 'Drift rate limit was exceeded', details = null) {
    super(message, DRIFT_ERROR_CODES.RATE_LIMITED, 429, details);
    this.name = 'RateLimitedError';
  }
}

class ServiceUnavailableError extends DriftError {
  constructor(message = 'Drift is temporarily unavailable', details = null) {
    super(message, DRIFT_ERROR_CODES.SERVICE_UNAVAILABLE, 503, details);
    this.name = 'ServiceUnavailableError';
  }
}

class ConfirmationTimeoutError extends DriftError {
  constructor(message = 'Drift confirmation timed out', details = null) {
    super(message, DRIFT_ERROR_CODES.CONFIRMATION_TIMEOUT, 408, details);
    this.name = 'ConfirmationTimeoutError';
  }
}

function isDriftError(error) {
  return Boolean(error && error.isDriftError === true);
}

function toDriftResponse(error) {
  if (isDriftError(error)) {
    return {
      statusCode: error.statusCode,
      body: error.toResponse(),
    };
  }
  return {
    statusCode: 500,
    body: {
      message: 'An unexpected error occurred in the Drift gateway',
      error: { code: DRIFT_ERROR_CODES.INTERNAL_ERROR },
    },
  };
}

module.exports = {
  DriftError,
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
  isDriftError,
  toDriftResponse,
};