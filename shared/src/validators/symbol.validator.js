/**
 * Symbol Validator
 *
 * Provides validation and normalization for trading symbols used
 * across the SignalForge platform. Supports common symbol aliases
 * (e.g., "GOLD" for "XAUUSD") and enforces canonical form.
 *
 * @module @signalforge/shared/validators/symbol
 */

const SYMBOL_REGEX = /^[A-Z0-9][A-Z0-9./-]{0,31}$/;

const MIN_SYMBOL_LENGTH = 1;
const MAX_SYMBOL_LENGTH = 32;

export const SYMBOL_ALIASES = Object.freeze({
  GOLD: 'XAUUSD',
  SILVER: 'XAGUSD',
  OIL: 'USOIL',
  WTI: 'USOIL',
  BRENT: 'UKOIL',
  'XAU/USD': 'XAUUSD',
  'XAG/USD': 'XAGUSD',
  'EUR/USD': 'EURUSD',
  'GBP/USD': 'GBPUSD',
  'USD/JPY': 'USDJPY',
  'AUD/USD': 'AUDUSD',
  'USD/CAD': 'USDCAD',
  'USD/CHF': 'USDCHF',
  'NZD/USD': 'NZDUSD',
  'EUR/GBP': 'EURGBP',
  'EUR/JPY': 'EURJPY',
  'GBP/JPY': 'GBPJPY',
  'US30': 'US30',
  'DJI': 'US30',
  'DOW': 'US30',
  'NAS100': 'NAS100',
  'NAS': 'NAS100',
  'NASDAQ': 'NAS100',
  'NDX': 'NAS100',
  'SPX500': 'SPX500',
  'SP500': 'SPX500',
  'SPX': 'SPX500',
  'GER40': 'GER40',
  'DAX': 'GER40',
  'UK100': 'UK100',
  'FTSE': 'UK100',
  'JP225': 'JP225',
  'NIKKEI': 'JP225',
  BTCUSD: 'BTCUSD',
  BTC: 'BTCUSD',
  BITCOIN: 'BTCUSD',
  ETHUSD: 'ETHUSD',
  ETH: 'ETHUSD',
  ETHEREUM: 'ETHUSD',
  SOLUSD: 'SOLUSD',
  SOL: 'SOLUSD',
});

export function normalizeSymbol(symbol) {
  if (!symbol || typeof symbol !== 'string') {
    return null;
  }

  const cleaned = symbol.trim().toUpperCase().replace(/\s+/g, '');

  if (SYMBOL_ALIASES[cleaned]) {
    return SYMBOL_ALIASES[cleaned];
  }

  return cleaned;
}

export function isValidSymbol(symbol) {
  if (!symbol || typeof symbol !== 'string') {
    return false;
  }

  const normalized = normalizeSymbol(symbol);

  if (!normalized) {
    return false;
  }

  if (
    normalized.length < MIN_SYMBOL_LENGTH ||
    normalized.length > MAX_SYMBOL_LENGTH
  ) {
    return false;
  }

  return SYMBOL_REGEX.test(normalized);
}

export function validateSymbol(symbol, options = {}) {
  const errors = [];

  if (!symbol || typeof symbol !== 'string') {
    return { valid: false, errors: ['Symbol is required'] };
  }

  const normalized = normalizeSymbol(symbol);

  if (!normalized) {
    return { valid: false, errors: ['Symbol could not be normalized'] };
  }

  if (normalized.length < MIN_SYMBOL_LENGTH) {
    errors.push(`Symbol must be at least ${MIN_SYMBOL_LENGTH} character`);
  }

  if (normalized.length > MAX_SYMBOL_LENGTH) {
    errors.push(`Symbol must not exceed ${MAX_SYMBOL_LENGTH} characters`);
  }

  if (!SYMBOL_REGEX.test(normalized)) {
    errors.push('Symbol contains invalid characters');
  }

  if (options.allowedSymbols && Array.isArray(options.allowedSymbols)) {
    if (!options.allowedSymbols.includes(normalized)) {
      errors.push(`Symbol ${normalized} is not in the allowed list`);
    }
  }

  if (options.blockedSymbols && Array.isArray(options.blockedSymbols)) {
    if (options.blockedSymbols.includes(normalized)) {
      errors.push(`Symbol ${normalized} is not permitted`);
    }
  }

  return { valid: errors.length === 0, errors, normalized };
}

export function symbolsMatch(symbolA, symbolB) {
  const a = normalizeSymbol(symbolA);
  const b = normalizeSymbol(symbolB);
  if (!a || !b) {
    return false;
  }
  return a === b;
}

export function isForexSymbol(symbol) {
  const normalized = normalizeSymbol(symbol);
  if (!normalized || normalized.length !== 6) {
    return false;
  }
  const base = normalized.substring(0, 3);
  const quote = normalized.substring(3, 6);
  return /^[A-Z]{3}$/.test(base) && /^[A-Z]{3}$/.test(quote);
}

export function isMetalSymbol(symbol) {
  const normalized = normalizeSymbol(symbol);
  return normalized === 'XAUUSD' || normalized === 'XAGUSD';
}

export function isCryptoSymbol(symbol) {
  const normalized = normalizeSymbol(symbol);
  return (
    normalized === 'BTCUSD' ||
    normalized === 'ETHUSD' ||
    normalized === 'SOLUSD'
  );
}

export function isIndexSymbol(symbol) {
  const normalized = normalizeSymbol(symbol);
  const indices = ['US30', 'NAS100', 'SPX500', 'GER40', 'UK100', 'JP225'];
  return indices.includes(normalized);
}

export const SYMBOL_CONSTRAINTS = Object.freeze({
  minLength: MIN_SYMBOL_LENGTH,
  maxLength: MAX_SYMBOL_LENGTH,
  pattern: SYMBOL_REGEX.source,
  aliasCount: Object.keys(SYMBOL_ALIASES).length,
});