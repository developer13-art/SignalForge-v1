'use strict';

const {
  INSTRUMENT_CLASSES,
} = require('./execution-router.constants');

/**
 * SignalForge - Instrument Class Service
 *
 * Classifies a symbol into an instrument class (forex, metals,
 * indices, crypto spot, crypto perp, etc.). Classification is purely
 * deterministic and does not require a network call, so it is safe to
 * invoke on every route resolution.
 */

const FOREX_CURRENCIES = new Set([
  'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'NZD', 'CAD', 'CHF',
  'SEK', 'NOK', 'DKK', 'PLN', 'HUF', 'CZK', 'TRY', 'ZAR',
  'MXN', 'SGD', 'HKD', 'CNH', 'CNY', 'INR', 'BRL', 'RUB',
  'AED', 'SAR', 'ILS', 'KRW', 'THB', 'MYR', 'IDR', 'PHP',
  'NGN', 'KES', 'GHS', 'EGP',
]);

const METALS = new Set(['XAU', 'XAG', 'XPT', 'XPD', 'GOLD', 'SILVER', 'PLATINUM', 'PALLADIUM']);

const INDICES = new Set([
  'SPX', 'SP500', 'US500', 'NDX', 'NAS100', 'US100', 'DJI', 'US30', 'DAX', 'GER30', 'GER40',
  'FTSE', 'UK100', 'NIKKEI', 'JP225', 'HSI', 'HK50', 'CAC', 'FRA40', 'ASX', 'AUS200',
  'VIX', 'DXY',
]);

const COMMODITIES = new Set([
  'WTI', 'BRENT', 'USOIL', 'UKOIL', 'NG', 'NATGAS', 'COPPER', 'CORN', 'WHEAT', 'SOYBEAN',
  'COCOA', 'COFFEE', 'SUGAR', 'COTTON',
]);

const CRYPTO_QUOTES = new Set(['USDT', 'USDC', 'BUSD', 'DAI', 'USD', 'USDE', 'FDUSD']);

const CRYPTO_BASES = new Set([
  'BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'AVAX', 'DOT', 'MATIC', 'POL',
  'LINK', 'UNI', 'ATOM', 'LTC', 'BCH', 'NEAR', 'APT', 'ARB', 'OP', 'INJ', 'SUI',
  'SEI', 'TIA', 'JUP', 'WIF', 'BONK', 'PYTH', 'RAY', 'ORCA', 'MEME', 'PEPE', 'SHIB',
  'TIA', 'FIL', 'AAVE', 'MKR', 'CRV', 'SNX', 'GRT', 'RNDR', 'FET', 'IMX', 'STX',
]);

const STABLES = new Set(['USDT', 'USDC', 'BUSD', 'DAI', 'USDE', 'FDUSD', 'TUSD', 'PYUSD']);

function normalizeSymbol(symbol) {
  if (!symbol) {
    return '';
  }
  return String(symbol)
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')
    .replace(/-/g, '');
}

function splitSymbol(symbol) {
  const normalized = normalizeSymbol(symbol);

  if (normalized.includes('/')) {
    const [base, quote] = normalized.split('/');
    return { base, quote, separator: '/' };
  }

  if (normalized.includes('_')) {
    const [base, quote] = normalized.split('_');
    return { base, quote, separator: '_' };
  }

  if (normalized.includes(':')) {
    const [base, quote] = normalized.split(':');
    return { base, quote, separator: ':' };
  }

  return { base: normalized, quote: null, separator: null };
}

function isPerpSymbol(symbol) {
  const upper = String(symbol).toUpperCase();
  return (
    upper.endsWith('-PERP') ||
    upper.endsWith('PERP') ||
    upper.includes('PERP') ||
    upper.endsWith('-SWAP') ||
    upper.startsWith('PERP:')
  );
}

function classify(symbol) {
  const { base, quote } = splitSymbol(symbol);
  const upperSymbol = String(symbol).toUpperCase();

  if (isPerpSymbol(symbol)) {
    return {
      instrumentClass: INSTRUMENT_CLASSES.CRYPTO_PERP,
      base: base.replace(/PERP|SWAP|-/g, ''),
      quote,
      isPerp: true,
      isCrypto: true,
    };
  }

  if (METALS.has(base) || (quote && METALS.has(quote))) {
    return {
      instrumentClass: INSTRUMENT_CLASSES.METALS,
      base,
      quote,
      isPerp: false,
      isCrypto: false,
    };
  }

  if (INDICES.has(base) || INDICES.has(upperSymbol)) {
    return {
      instrumentClass: INSTRUMENT_CLASSES.INDICES,
      base,
      quote,
      isPerp: false,
      isCrypto: false,
    };
  }

  if (COMMODITIES.has(base)) {
    return {
      instrumentClass: INSTRUMENT_CLASSES.COMMODITIES,
      base,
      quote,
      isPerp: false,
      isCrypto: false,
    };
  }

  if (STABLES.has(base) && STABLES.has(quote)) {
    return {
      instrumentClass: INSTRUMENT_CLASSES.STABLECOIN,
      base,
      quote,
      isPerp: false,
      isCrypto: true,
    };
  }

  if (CRYPTO_BASES.has(base) && (!quote || CRYPTO_QUOTES.has(quote))) {
    return {
      instrumentClass: INSTRUMENT_CLASSES.CRYPTO_SPOT,
      base,
      quote: quote || 'USD',
      isPerp: false,
      isCrypto: true,
    };
  }

  if (base.length === 6 && !quote) {
    const firstThree = base.slice(0, 3);
    const lastThree = base.slice(3, 6);
    if (FOREX_CURRENCIES.has(firstThree) && FOREX_CURRENCIES.has(lastThree)) {
      return {
        instrumentClass: INSTRUMENT_CLASSES.FOREX,
        base: firstThree,
        quote: lastThree,
        isPerp: false,
        isCrypto: false,
      };
    }
  }

  if (base.length === 7 && !quote) {
    const firstFour = base.slice(0, 4);
    const lastThree = base.slice(4, 7);
    if (FOREX_CURRENCIES.has(firstFour) && FOREX_CURRENCIES.has(lastThree)) {
      return {
        instrumentClass: INSTRUMENT_CLASSES.FOREX,
        base: firstFour,
        quote: lastThree,
        isPerp: false,
        isCrypto: false,
      };
    }
  }

  return {
    instrumentClass: INSTRUMENT_CLASSES.UNKNOWN,
    base,
    quote,
    isPerp: false,
    isCrypto: false,
  };
}

function isCrypto(instrumentClass) {
  return [
    INSTRUMENT_CLASSES.CRYPTO_SPOT,
    INSTRUMENT_CLASSES.CRYPTO_PERP,
    INSTRUMENT_CLASSES.CRYPTO_LP,
    INSTRUMENT_CLASSES.STABLECOIN,
  ].includes(instrumentClass);
}

function isTraditional(instrumentClass) {
  return [
    INSTRUMENT_CLASSES.FOREX,
    INSTRUMENT_CLASSES.METALS,
    INSTRUMENT_CLASSES.INDICES,
    INSTRUMENT_CLASSES.COMMODITIES,
  ].includes(instrumentClass);
}

function preferGateway(instrumentClass) {
  if (isTraditional(instrumentClass)) {
    return 'metaapi';
  }
  if (instrumentClass === INSTRUMENT_CLASSES.CRYPTO_PERP) {
    return 'perp';
  }
  if (isCrypto(instrumentClass)) {
    return 'dex';
  }
  return 'dex';
}

function describe(instrumentClass) {
  const descriptions = {
    [INSTRUMENT_CLASSES.FOREX]: 'Foreign exchange currency pair',
    [INSTRUMENT_CLASSES.METALS]: 'Precious metal',
    [INSTRUMENT_CLASSES.INDICES]: 'Equity or volatility index',
    [INSTRUMENT_CLASSES.COMMODITIES]: 'Commodity or energy future',
    [INSTRUMENT_CLASSES.CRYPTO_SPOT]: 'Cryptocurrency spot pair',
    [INSTRUMENT_CLASSES.CRYPTO_PERP]: 'Cryptocurrency perpetual contract',
    [INSTRUMENT_CLASSES.CRYPTO_LP]: 'Cryptocurrency liquidity pool position',
    [INSTRUMENT_CLASSES.STABLECOIN]: 'Stablecoin pair',
    [INSTRUMENT_CLASSES.UNKNOWN]: 'Unclassified instrument',
  };
  return descriptions[instrumentClass] || descriptions[INSTRUMENT_CLASSES.UNKNOWN];
}

function toSymbol(base, quote, { separator = '', isPerp = false } = {}) {
  const baseUpper = (base || '').toUpperCase();
  const quoteUpper = (quote || '').toUpperCase();
  const separatorPart = separator || (quoteUpper ? '' : '');
  const suffix = isPerp ? '-PERP' : '';
  return `${baseUpper}${separatorPart}${quoteUpper}${suffix}`;
}

module.exports = {
  FOREX_CURRENCIES,
  METALS,
  INDICES,
  COMMODITIES,
  CRYPTO_BASES,
  STABLES,
  normalizeSymbol,
  splitSymbol,
  isPerpSymbol,
  classify,
  isCrypto,
  isTraditional,
  preferGateway,
  describe,
  toSymbol,
};