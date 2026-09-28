'use strict';

const { MARKET_DATA_ERROR_CODES } = require('./market-data.constants');

/**
 * SignalForge - Crypto Market Data Error Types
 */

class MarketDataError extends Error {
  constructor(message, code = MARKET_DATA_ERROR_CODES.INTERNAL_ERROR, statusCode = 500, details = null) {
    super(message);
    this.name = 'MarketDataError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isMarketDataError = true;
    Error.captureStackTrace(this, MarketDataError);
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

class InvalidRequestError extends MarketDataError {
  constructor(message = 'The market data request is invalid', details = null) {
    super(message, MARKET_DATA_ERROR_CODES.INVALID_REQUEST, 400, details);
    this.name = 'InvalidRequestError';
  }
}

class SourceUnavailableError extends MarketDataError {
  constructor(message = 'The market data source is unavailable', details = null) {
    super(message, MARKET_DATA_ERROR_CODES.SOURCE_UNAVAILABLE, 503, details);
    this.name = 'SourceUnavailableError';
  }
}

class PriceNotFoundError extends MarketDataError {
  constructor(message = 'The price for the requested symbol was not found', details = null) {
    super(message, MARKET_DATA_ERROR_CODES.PRICE_NOT_FOUND, 404, details);
    this.name = 'PriceNotFoundError';
  }
}

class PriceStaleError extends MarketDataError {
  constructor(message = 'The price for the requested symbol is stale', details = null) {
    super(message, MARKET_DATA_ERROR_CODES.PRICE_STALE, 400, details);
    this.name = 'PriceStaleError';
  }
}

class PriceDivergenceError extends MarketDataError {
  constructor(message = 'Price divergence exceeds the allowed threshold', details = null) {
    super(message, MARKET_DATA_ERROR_CODES.PRICE_DIVERGENCE, 400, details);
    this.name = 'PriceDivergenceError';
  }
}

class LiquidityNotFoundError extends MarketDataError {
  constructor(message = 'Liquidity data was not found', details = null) {
    super(message, MARKET_DATA_ERROR_CODES.LIQUIDITY_NOT_FOUND, 404, details);
    this.name = 'LiquidityNotFoundError';
  }
}

class VolumeNotFoundError extends MarketDataError {
  constructor(message = 'Volume data was not found', details = null) {
    super(message, MARKET_DATA_ERROR_CODES.VOLUME_NOT_FOUND, 404, details);
    this.name = 'VolumeNotFoundError';
  }
}

class PoolNotFoundError extends MarketDataError {
  constructor(message = 'The requested pool was not found', details = null) {
    super(message, MARKET_DATA_ERROR_CODES.POOL_NOT_FOUND, 404, details);
    this.name = 'PoolNotFoundError';
  }
}

class TokenNotFoundError extends MarketDataError {
  constructor(message = 'The requested token was not found', details = null) {
    super(message, MARKET_DATA_ERROR_CODES.TOKEN_NOT_FOUND, 404, details);
    this.name = 'TokenNotFoundError';
  }
}

class CacheMissError extends MarketDataError {
  constructor(message = 'The requested data is not present in the cache', details = null) {
    super(message, MARKET_DATA_ERROR_CODES.CACHE_MISS, 404, details);
    this.name = 'CacheMissError';
  }
}

class RateLimitedError extends MarketDataError {
  constructor(message = 'The market data source rate limit was exceeded', details = null) {
    super(message, MARKET_DATA_ERROR_CODES.RATE_LIMITED, 429, details);
    this.name = 'RateLimitedError';
  }
}

function isMarketDataError(error) {
  return Boolean(error && error.isMarketDataError === true);
}

function toMarketDataResponse(error) {
  if (isMarketDataError(error)) {
    return {
      statusCode: error.statusCode,
      body: error.toResponse(),
    };
  }
  return {
    statusCode: 500,
    body: {
      message: 'An unexpected error occurred in the crypto market data subsystem',
      error: { code: MARKET_DATA_ERROR_CODES.INTERNAL_ERROR },
    },
  };
}

module.exports = {
  MarketDataError,
  InvalidRequestError,
  SourceUnavailableError,
  PriceNotFoundError,
  PriceStaleError,
  PriceDivergenceError,
  LiquidityNotFoundError,
  VolumeNotFoundError,
  PoolNotFoundError,
  TokenNotFoundError,
  CacheMissError,
  RateLimitedError,
  isMarketDataError,
  toMarketDataResponse,
};