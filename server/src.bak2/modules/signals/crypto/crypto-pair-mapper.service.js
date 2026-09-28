'use strict';

const crypto = require('crypto');

const cryptoRegistry = require('./crypto-symbol-registry');
const cryptoRepository = require('./crypto-symbol.repository');

const {
  CRYPTO_SYMBOL_CLASSES,
  CRYPTO_LOG_CONTEXT,
} = require('./crypto.constants');

const {
  InvalidSymbolError,
  UnknownBaseAssetError,
  UnknownQuoteAssetError,
} = require('./crypto.errors');

/**
 * SignalForge - Crypto Pair Mapper Service
 *
 * Converts a raw crypto symbol string into a canonical
 * { baseAsset, quoteAsset, symbolClass } tuple. The canonical form is
 * used for duplicate detection, routing, and price lookup.
 */

function generateSymbolId() {
  return `csym_${crypto.randomBytes(10).toString('hex')}`;
}

function normalizeSymbol(symbol) {
  if (!symbol) {
    return null;
  }
  return String(symbol).trim().toUpperCase().replace(/\s+/g, '');
}

function detectPerp(symbol) {
  const upper = String(symbol || '').toUpperCase();
  return (
    upper.endsWith('-PERP') ||
    upper.endsWith('PERP') ||
    upper.includes('PERP') ||
    upper.endsWith('-SWAP') ||
    upper.startsWith('PERP:')
  );
}

function detectSwap(symbol) {
  const upper = String(symbol || '').toUpperCase();
  return upper.endsWith('-SWAP') || upper.endsWith('SWAP');
}

function stripSuffixes(symbol) {
  return symbol
    .replace(/-PERP$/i, '')
    .replace(/PERP$/i, '')
    .replace(/-SWAP$/i, '')
    .replace(/SWAP$/i, '')
    .replace(/^PERP:/i, '');
}

function splitByExplicitDelimiter(symbol) {
  const upper = symbol.toUpperCase();
  if (upper.includes('/')) {
    const [base, quote] = upper.split('/');
    return { base: base.trim(), quote: quote.trim(), delimiter: '/' };
  }
  if (upper.includes('-')) {
    const [base, quote] = upper.split('-');
    return { base: base.trim(), quote: quote.trim(), delimiter: '-' };
  }
  if (upper.includes('_')) {
    const [base, quote] = upper.split('_');
    return { base: base.trim(), quote: quote.trim(), delimiter: '_' };
  }
  if (upper.includes(':')) {
    const [base, quote] = upper.split(':');
    return { base: base.trim(), quote: quote.trim(), delimiter: ':' };
  }
  return null;
}

function splitByConcatenation(symbol) {
  const upper = symbol.toUpperCase();
  const bases = cryptoRegistry.listBaseAssets().sort((a, b) => b.length - a.length);
  for (const base of bases) {
    if (upper.startsWith(base)) {
      const remainder = upper.slice(base.length);
      if (remainder && cryptoRegistry.isQuoteAsset(remainder)) {
        return { base, quote: remainder };
      }
    }
  }
  for (const base of bases) {
    if (upper.endsWith(base)) {
      const prefix = upper.slice(0, upper.length - base.length);
      if (prefix && cryptoRegistry.isQuoteAsset(prefix)) {
        return { base: prefix, quote: base };
      }
    }
  }
  return null;
}

function resolveParts(symbol) {
  const normalized = normalizeSymbol(symbol);
  if (!normalized) {
    throw new InvalidSymbolError('Symbol is required');
  }

  const isPerp = detectPerp(normalized);
  const isSwap = detectSwap(normalized);
  const stripped = stripSuffixes(normalized);

  const explicit = splitByExplicitDelimiter(stripped);
  if (explicit && explicit.base && explicit.quote) {
    return {
      base: explicit.base,
      quote: explicit.quote,
      delimiter: explicit.delimiter,
      isPerp,
      isSwap,
    };
  }

  const concatenated = splitByConcatenation(stripped);
  if (concatenated) {
    return {
      base: concatenated.base,
      quote: concatenated.quote,
      delimiter: null,
      isPerp,
      isSwap,
    };
  }

  throw new InvalidSymbolError(`Unable to split symbol ${normalized} into base and quote`, {
    symbol: normalized,
  });
}

function classifySymbolClass({ isPerp, isSwap }) {
  if (isPerp) {
    return CRYPTO_SYMBOL_CLASSES.PERP;
  }
  if (isSwap) {
    return CRYPTO_SYMBOL_CLASSES.SWAP;
  }
  return CRYPTO_SYMBOL_CLASSES.SPOT;
}

function buildCanonicalSymbol({ base, quote, isPerp, isSwap }) {
  const baseUpper = base.toUpperCase();
  const quoteUpper = quote.toUpperCase();
  const suffix = isPerp ? '-PERP' : isSwap ? '-SWAP' : '';
  return `${baseUpper}/${quoteUpper}${suffix}`;
}

async function mapPair({ symbol, source = 'signal' } = {}) {
  const parts = resolveParts(symbol);

  if (!cryptoRegistry.isBaseAsset(parts.base)) {
    throw new UnknownBaseAssetError(`Base asset ${parts.base} is not registered`, {
      base: parts.base,
      symbol,
    });
  }

  if (!cryptoRegistry.isQuoteAsset(parts.quote)) {
    throw new UnknownQuoteAssetError(`Quote asset ${parts.quote} is not registered`, {
      quote: parts.quote,
      symbol,
    });
  }

  const symbolClass = classifySymbolClass({
    isPerp: parts.isPerp,
    isSwap: parts.isSwap,
  });

  const canonicalSymbol = buildCanonicalSymbol({
    base: parts.base,
    quote: parts.quote,
    isPerp: parts.isPerp,
    isSwap: parts.isSwap,
  });

  const isStablePair =
    cryptoRegistry.isStableQuote(parts.base) && cryptoRegistry.isStableQuote(parts.quote);

  const persisted = await cryptoRepository.upsertSymbol(null, {
    id: generateSymbolId(),
    canonicalSymbol,
    baseAsset: parts.base.toUpperCase(),
    quoteAsset: parts.quote.toUpperCase(),
    symbolClass,
    isPerp: parts.isPerp,
    isSwap: parts.isSwap,
    isStablePair,
    metadata: {
      source,
      originalSymbol: symbol,
    },
  });

  return {
    canonicalSymbol,
    baseAsset: parts.base.toUpperCase(),
    quoteAsset: parts.quote.toUpperCase(),
    symbolClass,
    isPerp: parts.isPerp,
    isSwap: parts.isSwap,
    isStablePair,
    symbolId: persisted.id,
  };
}

async function mapMany({ symbols, source = 'signal' } = {}) {
  if (!Array.isArray(symbols)) {
    return [];
  }
  const results = [];
  for (const symbol of symbols) {
    try {
      const mapped = await mapPair({ symbol, source });
      results.push({ symbol, mapped, success: true });
    } catch (error) {
      results.push({
        symbol,
        mapped: null,
        success: false,
        error: error.message,
        code: error.code || 'CRYPTO_INVALID_SYMBOL',
      });
    }
  }
  return results;
}

function pickPreferredQuote(quotes) {
  return cryptoRegistry.pickPreferredQuote(quotes);
}

module.exports = {
  generateSymbolId,
  normalizeSymbol,
  detectPerp,
  detectSwap,
  stripSuffixes,
  splitByExplicitDelimiter,
  splitByConcatenation,
  resolveParts,
  classifySymbolClass,
  buildCanonicalSymbol,
  mapPair,
  mapMany,
  pickPreferredQuote,
  LOG_CONTEXT: CRYPTO_LOG_CONTEXT,
};