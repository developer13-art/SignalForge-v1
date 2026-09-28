'use strict';

const { CRYPTO_ERROR_CODES } = require('./crypto.constants');

/**
 * SignalForge - Crypto Signals Error Types
 */

class CryptoError extends Error {
  constructor(message, code = CRYPTO_ERROR_CODES.INTERNAL_ERROR, statusCode = 500, details = null) {
    super(message);
    this.name = 'CryptoError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isCryptoError = true;
    Error.captureStackTrace(this, CryptoError);
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

class InvalidSymbolError extends CryptoError {
  constructor(message = 'The crypto symbol is invalid', details = null) {
    super(message, CRYPTO_ERROR_CODES.INVALID_SYMBOL, 400, details);
    this.name = 'InvalidSymbolError';
  }
}

class UnknownBaseAssetError extends CryptoError {
  constructor(message = 'The base asset is not registered', details = null) {
    super(message, CRYPTO_ERROR_CODES.UNKNOWN_BASE_ASSET, 400, details);
    this.name = 'UnknownBaseAssetError';
  }
}

class UnknownQuoteAssetError extends CryptoError {
  constructor(message = 'The quote asset is not registered', details = null) {
    super(message, CRYPTO_ERROR_CODES.UNKNOWN_QUOTE_ASSET, 400, details);
    this.name = 'UnknownQuoteAssetError';
  }
}

class UnsupportedFormatError extends CryptoError {
  constructor(message = 'The crypto pair format is not supported', details = null) {
    super(message, CRYPTO_ERROR_CODES.UNSUPPORTED_FORMAT, 400, details);
    this.name = 'UnsupportedFormatError';
  }
}

class InvalidDirectionError extends CryptoError {
  constructor(message = 'The trade direction is invalid', details = null) {
    super(message, CRYPTO_ERROR_CODES.INVALID_DIRECTION, 400, details);
    this.name = 'InvalidDirectionError';
  }
}

class InvalidOrderTypeError extends CryptoError {
  constructor(message = 'The order type is invalid', details = null) {
    super(message, CRYPTO_ERROR_CODES.INVALID_ORDER_TYPE, 400, details);
    this.name = 'InvalidOrderTypeError';
  }
}

class InvalidPriceError extends CryptoError {
  constructor(message = 'The price value is invalid', details = null) {
    super(message, CRYPTO_ERROR_CODES.INVALID_PRICE, 400, details);
    this.name = 'InvalidPriceError';
  }
}

class InvalidAmountError extends CryptoError {
  constructor(message = 'The amount value is invalid', details = null) {
    super(message, CRYPTO_ERROR_CODES.INVALID_AMOUNT, 400, details);
    this.name = 'InvalidAmountError';
  }
}

class InvalidLlmResponseError extends CryptoError {
  constructor(message = 'The LLM response could not be parsed', details = null) {
    super(message, CRYPTO_ERROR_CODES.INVALID_LLM_RESPONSE, 500, details);
    this.name = 'InvalidLlmResponseError';
  }
}

class FingerprintFailedError extends CryptoError {
  constructor(message = 'Failed to compute the crypto fingerprint', details = null) {
    super(message, CRYPTO_ERROR_CODES.FINGERPRINT_FAILED, 500, details);
    this.name = 'FingerprintFailedError';
  }
}

class ServiceUnavailableError extends CryptoError {
  constructor(message = 'The crypto signals service is temporarily unavailable', details = null) {
    super(message, CRYPTO_ERROR_CODES.SERVICE_UNAVAILABLE, 503, details);
    this.name = 'ServiceUnavailableError';
  }
}

class NotFoundError extends CryptoError {
  constructor(message = 'The requested resource was not found', details = null) {
    super(message, CRYPTO_ERROR_CODES.NOT_FOUND, 404, details);
    this.name = 'NotFoundError';
  }
}

function isCryptoError(error) {
  return Boolean(error && error.isCryptoError === true);
}

function toCryptoResponse(error) {
  if (isCryptoError(error)) {
    return {
      statusCode: error.statusCode,
      body: error.toResponse(),
    };
  }
  return {
    statusCode: 500,
    body: {
      message: 'An unexpected error occurred in the crypto signals subsystem',
      error: { code: CRYPTO_ERROR_CODES.INTERNAL_ERROR },
    },
  };
}

module.exports = {
  CryptoError,
  InvalidSymbolError,
  UnknownBaseAssetError,
  UnknownQuoteAssetError,
  UnsupportedFormatError,
  InvalidDirectionError,
  InvalidOrderTypeError,
  InvalidPriceError,
  InvalidAmountError,
  InvalidLlmResponseError,
  FingerprintFailedError,
  ServiceUnavailableError,
  NotFoundError,
  isCryptoError,
  toCryptoResponse,
};