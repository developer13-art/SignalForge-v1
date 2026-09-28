'use strict';

/**
 * SignalForge - Crypto Market Data Constants
 *
 * Constants for the crypto market data subsystem. The subsystem
 * provides price feeds, liquidity snapshots, volume aggregation,
 * pool registries, and token metadata used by signals, risk, and
 * execution.
 */

const MARKET_DATA_SOURCES = Object.freeze({
  JUPITER: 'jupiter',
  RAYDIUM: 'raydium',
  ORCA: 'orca',
  BIRDEYE: 'birdeye',
  COINGECKO: 'coingecko',
  INTERNAL: 'internal',
});

const MARKET_DATA_SOURCE_PRIORITY = Object.freeze({
  jupiter: 100,
  raydium: 90,
  orca: 80,
  birdeye: 70,
  coingecko: 60,
  internal: 10,
});

const PRICE_FEED_STATUSES = Object.freeze({
  FRESH: 'fresh',
  STALE: 'stale',
  MISSING: 'missing',
  ERROR: 'error',
});

const LIQUIDITY_TIERS = Object.freeze({
  DEEP: 'deep',
  HEALTHY: 'healthy',
  MODERATE: 'moderate',
  THIN: 'thin',
  ILLIQUID: 'illiquid',
});

const LIQUIDITY_THRESHOLDS_USD = Object.freeze({
  deep: 5000000,
  healthy: 1000000,
  moderate: 250000,
  thin: 50000,
  illiquid: 0,
});

const VOLUME_WINDOWS = Object.freeze({
  H1: '1h',
  H6: '6h',
  H24: '24h',
  D7: '7d',
  D30: '30d',
});

const VOLUME_WINDOW_SECONDS = Object.freeze({
  '1h': 60 * 60,
  '6h': 6 * 60 * 60,
  '24h': 24 * 60 * 60,
  '7d': 7 * 24 * 60 * 60,
  '30d': 30 * 24 * 60 * 60,
});

const POOL_TYPES = Object.freeze({
  AMM: 'amm',
  CLMM: 'clmm',
  CPMM: 'cpmm',
  STABLE: 'stable',
});

const TOKEN_TAGS = Object.freeze({
  STABLE: 'stable',
  MEME: 'meme',
  MAJOR: 'major',
  LST: 'lst',
  GOVERNANCE: 'governance',
  LP: 'lp',
  WRAPPED: 'wrapped',
  UNKNOWN: 'unknown',
});

const MARKET_DATA_DEFAULTS = Object.freeze({
  PRICE_TTL_SECONDS: 15,
  LIQUIDITY_TTL_SECONDS: 60,
  VOLUME_TTL_SECONDS: 300,
  POOL_TTL_SECONDS: 300,
  TOKEN_TTL_SECONDS: 3600,
  PRICE_BATCH_SIZE: 50,
  MAX_POOLS_PER_SYMBOL: 10,
  MAX_SOURCES_PER_LOOKUP: 3,
});

const MARKET_DATA_MAX_STALE_SECONDS = 3600;

const MARKET_DATA_MAX_PRICE_DEVIATION_PCT = 15;

const MARKET_DATA_MIN_LIQUIDITY_USD = 1000;

const MARKET_DATA_ERROR_CODES = Object.freeze({
  INVALID_REQUEST: 'MARKET_DATA_INVALID_REQUEST',
  SOURCE_UNAVAILABLE: 'MARKET_DATA_SOURCE_UNAVAILABLE',
  PRICE_NOT_FOUND: 'MARKET_DATA_PRICE_NOT_FOUND',
  PRICE_STALE: 'MARKET_DATA_PRICE_STALE',
  PRICE_DIVERGENCE: 'MARKET_DATA_PRICE_DIVERGENCE',
  LIQUIDITY_NOT_FOUND: 'MARKET_DATA_LIQUIDITY_NOT_FOUND',
  VOLUME_NOT_FOUND: 'MARKET_DATA_VOLUME_NOT_FOUND',
  POOL_NOT_FOUND: 'MARKET_DATA_POOL_NOT_FOUND',
  TOKEN_NOT_FOUND: 'MARKET_DATA_TOKEN_NOT_FOUND',
  CACHE_MISS: 'MARKET_DATA_CACHE_MISS',
  RATE_LIMITED: 'MARKET_DATA_RATE_LIMITED',
  INTERNAL_ERROR: 'MARKET_DATA_INTERNAL_ERROR',
});

const MARKET_DATA_LOG_CONTEXT = 'market-data-crypto';

const MARKET_DATA_METRICS = Object.freeze({
  PRICE_FETCHES: 'market_data_price_fetches_total',
  PRICE_CACHE_HITS: 'market_data_price_cache_hits_total',
  PRICE_CACHE_MISSES: 'market_data_price_cache_misses_total',
  LIQUIDITY_FETCHES: 'market_data_liquidity_fetches_total',
  VOLUME_FETCHES: 'market_data_volume_fetches_total',
  POOL_FETCHES: 'market_data_pool_fetches_total',
  TOKEN_FETCHES: 'market_data_token_fetches_total',
  SOURCE_FAILURES: 'market_data_source_failures_total',
  LATENCY_MS: 'market_data_latency_ms',
});

const MARKET_DATA_KNOWN_PRICE_SOURCES = Object.freeze([
  MARKET_DATA_SOURCES.JUPITER,
  MARKET_DATA_SOURCES.RAYDIUM,
  MARKET_DATA_SOURCES.ORCA,
  MARKET_DATA_SOURCES.BIRDEYE,
  MARKET_DATA_SOURCES.COINGECKO,
]);

module.exports = Object.freeze({
  MARKET_DATA_SOURCES,
  MARKET_DATA_SOURCE_PRIORITY,
  PRICE_FEED_STATUSES,
  LIQUIDITY_TIERS,
  LIQUIDITY_THRESHOLDS_USD,
  VOLUME_WINDOWS,
  VOLUME_WINDOW_SECONDS,
  POOL_TYPES,
  TOKEN_TAGS,
  MARKET_DATA_DEFAULTS,
  MARKET_DATA_MAX_STALE_SECONDS,
  MARKET_DATA_MAX_PRICE_DEVIATION_PCT,
  MARKET_DATA_MIN_LIQUIDITY_USD,
  MARKET_DATA_ERROR_CODES,
  MARKET_DATA_LOG_CONTEXT,
  MARKET_DATA_METRICS,
  MARKET_DATA_KNOWN_PRICE_SOURCES,
});