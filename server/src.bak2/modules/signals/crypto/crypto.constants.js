'use strict';

/**
 * SignalForge - Crypto Signals Constants
 *
 * Constants for the crypto signals subsystem. This module is the
 * single source of truth for crypto symbol classes, pair formats,
 * and the fingerprinting contract used for duplicate detection
 * across crypto pairs.
 */

const CRYPTO_QUOTE_ASSETS = Object.freeze([
  'USD',
  'USDT',
  'USDC',
  'BUSD',
  'DAI',
  'USDE',
  'FDUSD',
  'TUSD',
  'PYUSD',
  'BTC',
  'ETH',
  'SOL',
]);

const CRYPTO_QUOTE_PRIORITY = Object.freeze({
  USDT: 100,
  USDC: 90,
  USD: 80,
  FDUSD: 70,
  DAI: 60,
  USDE: 50,
  BUSD: 40,
  TUSD: 30,
  PYUSD: 20,
  BTC: 15,
  ETH: 10,
  SOL: 5,
});

const CRYPTO_STABLE_QUOTES = Object.freeze([
  'USDT',
  'USDC',
  'USD',
  'BUSD',
  'DAI',
  'USDE',
  'FDUSD',
  'TUSD',
  'PYUSD',
]);

const CRYPTO_BASE_ASSETS = Object.freeze([
  'BTC',
  'ETH',
  'SOL',
  'BNB',
  'XRP',
  'ADA',
  'DOGE',
  'AVAX',
  'DOT',
  'POL',
  'MATIC',
  'LINK',
  'UNI',
  'ATOM',
  'LTC',
  'BCH',
  'NEAR',
  'APT',
  'ARB',
  'OP',
  'INJ',
  'SUI',
  'SEI',
  'TIA',
  'JUP',
  'WIF',
  'BONK',
  'PYTH',
  'RAY',
  'ORCA',
  'MEME',
  'PEPE',
  'SHIB',
  'FIL',
  'AAVE',
  'MKR',
  'CRV',
  'SNX',
  'GRT',
  'RNDR',
  'FET',
  'IMX',
  'STX',
  'SEI',
  'FTM',
  'HBAR',
  'ICP',
  'EGLD',
  'THETA',
  'ALGO',
  'VET',
  'XLM',
  'XTZ',
  'EOS',
  'TRX',
  'TON',
  'KAS',
  'WLD',
  'STRK',
  'PIXEL',
  'BLUR',
  'ORDI',
  'SATS',
  'RATS',
]);

const CRYPTO_PAIR_FORMATS = Object.freeze({
  SLASH: 'BTC/USDT',
  DASH: 'BTC-USDT',
  UNDERSCORE: 'BTC_USDT',
  COLON: 'BTC:USDT',
  NOSPACE: 'BTCUSDT',
  PERP_SUFFIX: 'BTCUSDT-PERP',
  PERP_PREFIX: 'PERP:BTCUSDT',
  SWAP_SUFFIX: 'BTCUSDT-SWAP',
});

const CRYPTO_SYMBOL_CLASSES = Object.freeze({
  SPOT: 'crypto_spot',
  PERP: 'crypto_perp',
  SWAP: 'crypto_swap',
  UNKNOWN: 'crypto_unknown',
});

const CRYPTO_DIRECTIONS = Object.freeze({
  LONG: 'BUY',
  SHORT: 'SELL',
  BUY: 'BUY',
  SELL: 'SELL',
});

const CRYPTO_ORDER_TYPES = Object.freeze({
  MARKET: 'market',
  LIMIT: 'limit',
  STOP: 'stop',
  STOP_LIMIT: 'stop_limit',
  TRAILING_STOP: 'trailing_stop',
});

const CRYPTO_FINGERPRINT_ALGORITHM = 'sha256';

const CRYPTO_FINGERPRINT_VERSION = 1;

const CRYPTO_FINGERPRINT_FIELDS = Object.freeze([
  'canonicalSymbol',
  'direction',
  'entryType',
  'entryPrice',
  'stopLoss',
  'takeProfit',
]);

const CRYPTO_LLM_PROMPT_VERSION = 1;

const CRYPTO_MAX_SYMBOL_LENGTH = 32;

const CRYPTO_MAX_PROMPT_LENGTH = 8000;

const CRYPTO_MIN_CONFIDENCE_THRESHOLD = 0.8;

const CRYPTO_MAX_CONFIDENCE_THRESHOLD = 1;

const CRYPTO_DEFAULT_CONFIDENCE_THRESHOLD = 0.8;

const CRYPTO_ERROR_CODES = Object.freeze({
  INVALID_SYMBOL: 'CRYPTO_INVALID_SYMBOL',
  UNKNOWN_BASE_ASSET: 'CRYPTO_UNKNOWN_BASE_ASSET',
  UNKNOWN_QUOTE_ASSET: 'CRYPTO_UNKNOWN_QUOTE_ASSET',
  UNSUPPORTED_FORMAT: 'CRYPTO_UNSUPPORTED_FORMAT',
  INVALID_DIRECTION: 'CRYPTO_INVALID_DIRECTION',
  INVALID_ORDER_TYPE: 'CRYPTO_INVALID_ORDER_TYPE',
  INVALID_PRICE: 'CRYPTO_INVALID_PRICE',
  INVALID_AMOUNT: 'CRYPTO_INVALID_AMOUNT',
  INVALID_LLM_RESPONSE: 'CRYPTO_INVALID_LLM_RESPONSE',
  FINGERPRINT_FAILED: 'CRYPTO_FINGERPRINT_FAILED',
  SERVICE_UNAVAILABLE: 'CRYPTO_SERVICE_UNAVAILABLE',
  NOT_FOUND: 'CRYPTO_NOT_FOUND',
  INTERNAL_ERROR: 'CRYPTO_INTERNAL_ERROR',
});

const CRYPTO_LOG_CONTEXT = 'crypto-signals';

const CRYPTO_METRICS = Object.freeze({
  SYMBOLS_NORMALIZED: 'crypto_symbols_normalized_total',
  SYMBOLS_UNKNOWN: 'crypto_symbols_unknown_total',
  PAIRS_MAPPED: 'crypto_pairs_mapped_total',
  DUPLICATES_DETECTED: 'crypto_duplicates_detected_total',
  FINGERPRINTS_CREATED: 'crypto_fingerprints_created_total',
  LLM_PROMPTS_SENT: 'crypto_llm_prompts_sent_total',
  LLM_RESPONSES_FAILED: 'crypto_llm_responses_failed_total',
});

module.exports = Object.freeze({
  CRYPTO_QUOTE_ASSETS,
  CRYPTO_QUOTE_PRIORITY,
  CRYPTO_STABLE_QUOTES,
  CRYPTO_BASE_ASSETS,
  CRYPTO_PAIR_FORMATS,
  CRYPTO_SYMBOL_CLASSES,
  CRYPTO_DIRECTIONS,
  CRYPTO_ORDER_TYPES,
  CRYPTO_FINGERPRINT_ALGORITHM,
  CRYPTO_FINGERPRINT_VERSION,
  CRYPTO_FINGERPRINT_FIELDS,
  CRYPTO_LLM_PROMPT_VERSION,
  CRYPTO_MAX_SYMBOL_LENGTH,
  CRYPTO_MAX_PROMPT_LENGTH,
  CRYPTO_MIN_CONFIDENCE_THRESHOLD,
  CRYPTO_MAX_CONFIDENCE_THRESHOLD,
  CRYPTO_DEFAULT_CONFIDENCE_THRESHOLD,
  CRYPTO_ERROR_CODES,
  CRYPTO_LOG_CONTEXT,
  CRYPTO_METRICS,
});