'use strict';

const { PublicKey } = require('@solana/web3.js');

const {
  SHARED_DEX_MINTS,
  SHARED_TOKEN_DECIMALS,
  SHARED_ERROR_CODES,
} = require('./shared.constants');

/**
 * SignalForge - Token Meta Service
 *
 * The canonical source of truth for token metadata across every DEX
 * gateway. Gateways consult this service instead of maintaining their
 * own static registries; per-gateway token services extend it.
 */

class TokenNotFoundError extends Error {
  constructor(identifier) {
    super(`Token ${identifier} is not registered`);
    this.name = 'TokenNotFoundError';
    this.code = SHARED_ERROR_CODES.TOKEN_NOT_FOUND;
    this.identifier = identifier;
    this.isSharedDexError = true;
  }
}

const STATIC_MINTS = Object.freeze({ ...SHARED_DEX_MINTS });
const STATIC_DECIMALS = Object.freeze({ ...SHARED_TOKEN_DECIMALS });

const SYMBOL_TO_MINT = Object.freeze(
  Object.entries(STATIC_MINTS).reduce((acc, [symbol, mint]) => {
    acc[symbol.toUpperCase()] = mint;
    acc[mint] = symbol.toUpperCase();
    return acc;
  }, {}),
);

function isBase58Address(value) {
  if (!value || typeof value !== 'string') {
    return false;
  }
  try {
    // eslint-disable-next-line no-new
    new PublicKey(value);
    return true;
  } catch (_error) {
    return false;
  }
}

function normalizeSymbol(symbol) {
  if (!symbol) {
    return null;
  }
  return String(symbol).trim().toUpperCase();
}

function resolveMint(symbol) {
  const normalized = normalizeSymbol(symbol);
  if (!normalized) {
    throw new TokenNotFoundError(symbol);
  }
  if (isBase58Address(normalized)) {
    return normalized;
  }
  const mint = SYMBOL_TO_MINT[normalized];
  if (!mint) {
    throw new TokenNotFoundError(symbol);
  }
  return mint;
}

function resolveSymbol(mint) {
  if (!mint) {
    return null;
  }
  return SYMBOL_TO_MINT[mint] || null;
}

function resolveDecimals(symbolOrMint) {
  const symbol = resolveSymbol(symbolOrMint) || normalizeSymbol(symbolOrMint);
  if (!symbol) {
    return null;
  }
  return STATIC_DECIMALS[symbol] ?? null;
}

function toBaseUnits(amount, decimals) {
  const numeric = Number(amount);
  if (!Number.isFinite(numeric)) {
    return 0;
  }
  const factor = Math.pow(10, Number(decimals) || 0);
  return Math.round(numeric * factor);
}

function fromBaseUnits(baseUnits, decimals) {
  const numeric = Number(baseUnits);
  if (!Number.isFinite(numeric)) {
    return 0;
  }
  const factor = Math.pow(10, Number(decimals) || 0);
  return numeric / factor;
}

function registerToken({ symbol, mint, decimals }) {
  if (!symbol || !mint) {
    throw new Error('symbol and mint are required to register a token');
  }
  const normalized = normalizeSymbol(symbol);
  STATIC_MINTS[normalized] = mint;
  STATIC_MINTS[mint] = normalized;
  if (Number.isInteger(decimals)) {
    STATIC_DECIMALS[normalized] = decimals;
  }
  return { symbol: normalized, mint, decimals };
}

function listRegisteredTokens() {
  return Object.entries(STATIC_MINTS)
    .filter(([key]) => key === key.toUpperCase() && key.length <= 8)
    .map(([symbol, mint]) => ({
      symbol,
      mint,
      decimals: STATIC_DECIMALS[symbol] ?? null,
    }));
}

module.exports = {
  TokenNotFoundError,
  isBase58Address,
  normalizeSymbol,
  resolveMint,
  resolveSymbol,
  resolveDecimals,
  toBaseUnits,
  fromBaseUnits,
  registerToken,
  listRegisteredTokens,
  STATIC_MINTS,
  STATIC_DECIMALS,
};