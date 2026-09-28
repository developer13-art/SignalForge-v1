'use strict';

const { PublicKey } = require('@solana/web3.js');

const jupiterClient = require('./jupiter-client.service');

const {
  JUPITER_KNOWN_MINTS,
} = require('./jupiter.constants');

const {
  TokenNotFoundError,
} = require('./jupiter.errors');

/**
 * SignalForge - Jupiter Token Service
 *
 * Resolves token symbols to SPL mints and vice versa. Prefers the
 * static known-mints registry for the tokens SignalForge is guaranteed
 * to support; falls back to Jupiter's token list for unknown symbols.
 */

let cachedTokens = null;
let cachedTokensAt = 0;

const TOKEN_CACHE_TTL_MS = 30 * 60 * 1000;

const STATIC_SYMBOLS = Object.freeze(
  Object.entries(JUPITER_KNOWN_MINTS).reduce((acc, [symbol, mint]) => {
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

function resolveFromStatic(symbol) {
  const normalized = normalizeSymbol(symbol);
  if (!normalized) {
    return null;
  }
  return STATIC_SYMBOLS[normalized] || null;
}

async function loadTokens(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedTokens && now - cachedTokensAt < TOKEN_CACHE_TTL_MS) {
    return cachedTokens;
  }

  try {
    const tokens = await jupiterClient.fetchTokens();
    const map = {
      bySymbol: {},
      byMint: {},
    };

    for (const token of tokens) {
      if (!token || !token.address) {
        continue;
      }
      const symbol = token.symbol ? token.symbol.toUpperCase() : null;
      if (symbol) {
        map.bySymbol[symbol] = token;
      }
      map.byMint[token.address] = token;
    }

    cachedTokens = map;
    cachedTokensAt = now;
    return map;
  } catch (_error) {
    return cachedTokens || { bySymbol: {}, byMint: {} };
  }
}

async function resolveMint(symbolOrMint) {
  const input = symbolOrMint;
  if (!input) {
    throw new TokenNotFoundError('Token identifier is required');
  }

  if (isBase58Address(input)) {
    return input;
  }

  const staticMint = resolveFromStatic(input);
  if (staticMint) {
    return staticMint;
  }

  const tokens = await loadTokens();
  const normalized = normalizeSymbol(input);
  const found = tokens.bySymbol[normalized];

  if (found && found.address) {
    return found.address;
  }

  throw new TokenNotFoundError(`Token ${input} is not supported by Jupiter`, {
    identifier: input,
  });
}

async function resolveSymbol(mint) {
  if (!mint) {
    return null;
  }

  const staticSymbol = STATIC_SYMBOLS[mint];
  if (staticSymbol) {
    return staticSymbol;
  }

  const tokens = await loadTokens();
  const found = tokens.byMint[mint];
  if (found && found.symbol) {
    return found.symbol.toUpperCase();
  }

  return null;
}

async function resolveDecimals(mint) {
  if (!mint) {
    return null;
  }

  const tokens = await loadTokens();
  const found = tokens.byMint[mint];
  if (found && Number.isInteger(found.decimals)) {
    return found.decimals;
  }

  return null;
}

async function resolveTokenMetadata(mint) {
  if (!mint) {
    return null;
  }
  const tokens = await loadTokens();
  const found = tokens.byMint[mint];
  if (!found) {
    return null;
  }
  return {
    mint: found.address,
    symbol: found.symbol,
    name: found.name,
    decimals: found.decimals,
    logoURI: found.logoURI,
    tags: found.tags || [],
  };
}

async function listSupportedTokens() {
  const tokens = await loadTokens();
  return Object.values(tokens.byMint);
}

function listStaticTokens() {
  return Object.entries(JUPITER_KNOWN_MINTS).map(([symbol, mint]) => ({
    symbol,
    mint,
  }));
}

function clearCache() {
  cachedTokens = null;
  cachedTokensAt = 0;
}

module.exports = {
  JUPITER_KNOWN_MINTS,
  isBase58Address,
  normalizeSymbol,
  resolveFromStatic,
  loadTokens,
  resolveMint,
  resolveSymbol,
  resolveDecimals,
  resolveTokenMetadata,
  listSupportedTokens,
  listStaticTokens,
  clearCache,
};