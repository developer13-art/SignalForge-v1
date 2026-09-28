'use strict';

const cryptoSymbolService = require('./crypto-symbol.service');
const cryptoNormalizer = require('./crypto-normalizer.service');
const cryptoValidator = require('./crypto.validator');
const cryptoFingerprint = require('./crypto-fingerprint.service');
const cryptoPairMapper = require('./crypto-pair-mapper.service');

/**
 * SignalForge - Crypto Symbol HTTP Controller
 *
 * Public endpoints for symbol normalization, classification, and
 * preview. Endpoints are stateless and safe to call from the frontend
 * as the user types.
 */

async function normalize(req, res, next) {
  try {
    const { symbol } = req.params;
    const result = await cryptoSymbolService.normalizeSymbol(symbol);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function classify(req, res, next) {
  try {
    const { symbol } = req.params;
    const result = cryptoSymbolService.classifySymbol(symbol);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function normalizeBatch(req, res, next) {
  try {
    const symbols = Array.isArray(req.body?.symbols) ? req.body.symbols : [];
    if (symbols.length === 0) {
      return res.status(400).json({
        message: 'symbols must be a non-empty array',
        error: { code: 'CRYPTO_INVALID_SYMBOL' },
      });
    }
    const result = await cryptoSymbolService.normalizeMany(symbols);
    return res.status(200).json({ results: result });
  } catch (error) {
    return next(error);
  }
}

async function fingerprint(req, res, next) {
  try {
    const payload = cryptoValidator.validateSignalPayload(req.body || {});
    const normalized = await cryptoNormalizer.normalizeCryptoSignal(payload);
    const result = cryptoFingerprint.describeFingerprint(normalized);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function lookup(req, res, next) {
  try {
    const { canonical } = req.params;
    const result = await cryptoSymbolService.lookupSymbol(canonical);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function list(req, res, next) {
  try {
    const page = Number.parseInt(req.query.page, 10) || 1;
    const pageSize = Number.parseInt(req.query.pageSize, 10) || 100;
    const symbolClass = req.query.symbolClass || undefined;
    const result = await cryptoSymbolService.listSymbols({ symbolClass, page, pageSize });
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function registry(req, res, next) {
  try {
    const snapshot = cryptoSymbolService.registrySnapshot();
    return res.status(200).json(snapshot);
  } catch (error) {
    return next(error);
  }
}

async function describe(req, res, next) {
  try {
    const { symbol } = req.params;
    const result = await cryptoSymbolService.describeSymbol(symbol);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

function formats(_req, res, next) {
  try {
    const mapper = cryptoPairMapper;
    return res.status(200).json({
      examples: [
        mapper.buildCanonicalSymbol({ base: 'BTC', quote: 'USDT', isPerp: false }),
        mapper.buildCanonicalSymbol({ base: 'SOL', quote: 'USDC', isPerp: false }),
        mapper.buildCanonicalSymbol({ base: 'BTC', quote: 'USDT', isPerp: true }),
      ],
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  normalize,
  classify,
  normalizeBatch,
  fingerprint,
  lookup,
  list,
  registry,
  describe,
  formats,
};