'use strict';

const {
  CRYPTO_BASE_ASSETS,
  CRYPTO_QUOTE_ASSETS,
  CRYPTO_QUOTE_PRIORITY,
  CRYPTO_STABLE_QUOTES,
  CRYPTO_SYMBOL_CLASSES,
} = require('./crypto.constants');

/**
 * SignalForge - Crypto Symbol Registry
 *
 * The canonical, in-memory registry of crypto base and quote assets.
 * This module is the single source of truth for symbol classification
 * and quote asset selection across the crypto signals pipeline.
 */

const BASE_ASSET_INDEX = Object.freeze(
  CRYPTO_BASE_ASSETS.reduce((acc, symbol) => {
    acc[symbol.toUpperCase()] = true;
    return acc;
  }, {}),
);

const QUOTE_ASSET_INDEX = Object.freeze(
  CRYPTO_QUOTE_ASSETS.reduce((acc, symbol) => {
    acc[symbol.toUpperCase()] = true;
    return acc;
  }, {}),
);

const STABLE_QUOTE_INDEX = Object.freeze(
  CRYPTO_STABLE_QUOTES.reduce((acc, symbol) => {
    acc[symbol.toUpperCase()] = true;
    return acc;
  }, {}),
);

function normalizeSymbol(symbol) {
  if (symbol === undefined || symbol === null) {
    return null;
  }
  return String(symbol).trim().toUpperCase().replace(/\s+/g, '');
}

function isBaseAsset(symbol) {
  const normalized = normalizeSymbol(symbol);
  if (!normalized) {
    return false;
  }
  return Boolean(BASE_ASSET_INDEX[normalized]);
}

function isQuoteAsset(symbol) {
  const normalized = normalizeSymbol(symbol);
  if (!normalized) {
    return false;
  }
  return Boolean(QUOTE_ASSET_INDEX[normalized]);
}

function isStableQuote(symbol) {
  const normalized = normalizeSymbol(symbol);
  if (!normalized) {
    return false;
  }
  return Boolean(STABLE_QUOTE_INDEX[normalized]);
}

function resolveQuotePriority(quote) {
  const normalized = normalizeSymbol(quote);
  if (!normalized) {
    return 0;
  }
  return CRYPTO_QUOTE_PRIORITY[normalized] ?? 0;
}

function pickPreferredQuote(quotes) {
  if (!Array.isArray(quotes) || quotes.length === 0) {
    return null;
  }
  return quotes
    .filter((quote) => isQuoteAsset(quote))
    .sort((a, b) => resolveQuotePriority(b) - resolveQuotePriority(a))[0] || null;
}

function classifySymbolClass({ isPerp = false, isSwap = false } = {}) {
  if (isPerp) {
    return CRYPTO_SYMBOL_CLASSES.PERP;
  }
  if (isSwap) {
    return CRYPTO_SYMBOL_CLASSES.SWAP;
  }
  return CRYPTO_SYMBOL_CLASSES.SPOT;
}

function listBaseAssets() {
  return [...CRYPTO_BASE_ASSETS];
}

function listQuoteAssets() {
  return [...CRYPTO_QUOTE_ASSETS];
}

function listStableQuotes() {
  return [...CRYPTO_STABLE_QUOTES];
}

function registerBaseAsset(symbol) {
  const normalized = normalizeSymbol(symbol);
  if (!normalized) {
    return false;
  }
  BASE_ASSET_INDEX[normalized] = true;
  if (!CRYPTO_BASE_ASSETS.includes(normalized)) {
    CRYPTO_BASE_ASSETS.push(normalized);
  }
  return true;
}

function registerQuoteAsset(symbol, priority = 0) {
  const normalized = normalizeSymbol(symbol);
  if (!normalized) {
    return false;
  }
  QUOTE_ASSET_INDEX[normalized] = true;
  if (!CRYPTO_QUOTE_ASSETS.includes(normalized)) {
    CRYPTO_QUOTE_ASSETS.push(normalized);
  }
  if (priority > 0) {
    CRYPTO_QUOTE_PRIORITY[normalized] = priority;
  }
  return true;
}

function getRegistrySnapshot() {
  return {
    baseAssets: listBaseAssets(),
    quoteAssets: listQuoteAssets(),
    stableQuotes: listStableQuotes(),
    quotePriorities: { ...CRYPTO_QUOTE_PRIORITY },
  };
}

module.exports = {
  BASE_ASSET_INDEX,
  QUOTE_ASSET_INDEX,
  STABLE_QUOTE_INDEX,
  normalizeSymbol,
  isBaseAsset,
  isQuoteAsset,
  isStableQuote,
  resolveQuotePriority,
  pickPreferredQuote,
  classifySymbolClass,
  listBaseAssets,
  listQuoteAssets,
  listStableQuotes,
  registerBaseAsset,
  registerQuoteAsset,
  getRegistrySnapshot,
};