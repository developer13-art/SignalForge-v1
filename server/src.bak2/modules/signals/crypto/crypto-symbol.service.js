'use strict';

const cryptoPairMapper = require('./crypto-pair-mapper.service');
const cryptoNormalizer = require('./crypto-normalizer.service');
const cryptoRepository = require('./crypto-symbol.repository');
const cryptoRegistry = require('./crypto-symbol-registry');

const {
  CRYPTO_SYMBOL_CLASSES,
} = require('./crypto.constants');

const {
  NotFoundError,
} = require('./crypto.errors');

/**
 * SignalForge - Crypto Symbol Service
 *
 * The service layer for crypto symbols. It exposes normalization,
 * classification, and persistence operations to the rest of the
 * platform without leaking repository details.
 */

async function normalizeSymbol(symbol) {
  return cryptoPairMapper.mapPair({ symbol });
}

async function normalizeMany(symbols) {
  return cryptoPairMapper.mapMany({ symbols });
}

async function classifySymbol(symbol) {
  return cryptoNormalizer.classifySymbol(symbol);
}

async function lookupSymbol(canonicalSymbol) {
  const persisted = await cryptoRepository.findSymbolByCanonical(canonicalSymbol);
  if (!persisted) {
    throw new NotFoundError(`Symbol ${canonicalSymbol} was not found`, { canonicalSymbol });
  }
  return persisted;
}

async function lookupAlias(alias) {
  const normalizedAlias = cryptoRegistry.normalizeSymbol(alias);
  if (!normalizedAlias) {
    throw new NotFoundError('Alias is required');
  }
  const record = await cryptoRepository.findAlias(normalizedAlias);
  if (!record) {
    throw new NotFoundError(`Alias ${alias} was not found`, { alias });
  }
  return record;
}

async function listSymbols(filters) {
  return cryptoRepository.listSymbols(filters);
}

async function countSymbols(filters) {
  return cryptoRepository.countSymbols(filters);
}

async function registerAlias({ symbolId, alias, source = 'signal' }) {
  const normalizedAlias = cryptoRegistry.normalizeSymbol(alias);
  if (!normalizedAlias) {
    throw new NotFoundError('Alias is required');
  }
  const crypto = require('crypto');
  return cryptoRepository.upsertAlias(null, {
    id: `calias_${crypto.randomBytes(8).toString('hex')}`,
    symbolId,
    alias,
    normalizedAlias,
    source,
  });
}

function listRegisteredBaseAssets() {
  return cryptoRegistry.listBaseAssets();
}

function listRegisteredQuoteAssets() {
  return cryptoRegistry.listQuoteAssets();
}

function isKnownBaseAsset(symbol) {
  return cryptoRegistry.isBaseAsset(symbol);
}

function isKnownQuoteAsset(symbol) {
  return cryptoRegistry.isQuoteAsset(symbol);
}

function pickPreferredQuote(quotes) {
  return cryptoRegistry.pickPreferredQuote(quotes);
}

function registrySnapshot() {
  return cryptoRegistry.getRegistrySnapshot();
}

async function describeSymbol(symbol) {
  try {
    const mapped = await normalizeSymbol(symbol);
    return {
      canonicalSymbol: mapped.canonicalSymbol,
      baseAsset: mapped.baseAsset,
      quoteAsset: mapped.quoteAsset,
      symbolClass: mapped.symbolClass,
      isPerp: mapped.isPerp,
      isSwap: mapped.isSwap,
      isStablePair: mapped.isStablePair,
    };
  } catch (error) {
    return {
      canonicalSymbol: null,
      error: error.message,
      code: error.code,
    };
  }
}

module.exports = {
  normalizeSymbol,
  normalizeMany,
  classifySymbol,
  lookupSymbol,
  lookupAlias,
  listSymbols,
  countSymbols,
  registerAlias,
  listRegisteredBaseAssets,
  listRegisteredQuoteAssets,
  isKnownBaseAsset,
  isKnownQuoteAsset,
  pickPreferredQuote,
  registrySnapshot,
  describeSymbol,
  SYMBOL_CLASSES: CRYPTO_SYMBOL_CLASSES,
};