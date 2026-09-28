'use strict';

const { PublicKey } = require('@solana/web3.js');

const raydiumClient = require('./raydium-client.service');

const {
  RAYDIUM_KNOWN_MINTS,
} = require('./raydium.constants');

const {
  TokenNotFoundError,
} = require('./raydium.errors');

/**
 * SignalForge - Raydium Token Service
 *
 * Resolves token symbols to SPL mints and vice versa for the Raydium
 * gateway. Prefers a static registry for known tokens and falls back
 * to the Raydium token list for unknown symbols.
 */

let cachedTokens = null;
let cachedTokensAt = 0;

const TOKEN_CACHE_TTL_MS = 30 * 60 * 1000;

const STATIC_SYMBOLS = Object.freeze(
  Object.entries(RAYDIUM_KNOWN_MINTS).reduce((acc, [symbol, mint]) => {
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
    const response = await raydiumClient.request('/tokens', {
      method: 'GET',
      timeoutMs: 30000,
    });

    const list = Array.isArray(response)
      ? response
      : Array.isArray(response?.data)
      ? response.data
      : [];

    const map = { bySymbol: {}, byMint: {} };

    for (const token of list) {
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
  if (!symbolOrMint) {
    throw new TokenNotFoundError('Token identifier is required');
  }
  if (isBase58Address(symbolOrMint)) {
    return symbolOrMint;
  }
  const staticMint = resolveFromStatic(symbolOrMint);
  if (staticMint) {
    return staticMint;
  }
  const tokens = await loadTokens();
  const normalized = normalizeSymbol(symbolOrMint);
  const found = tokens.bySymbol[normalized];
  if (found && found.address) {
    return found.address;
  }
  throw new TokenNotFoundError(`Token ${symbolOrMint} is not supported by Raydium`, {
    identifier: symbolOrMint,
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
    logoURI: found.logoURI || found.logo,
    tags: found.tags || [],
  };
}

async function listSupportedTokens() {
  const tokens = await loadTokens();
  return Object.values(tokens.byMint);
}

function listStaticTokens() {
  return Object.entries(RAYDIUM_KNOWN_MINTS).map(([symbol, mint]) => ({ symbol, mint }));
}

function clearCache() {
  cachedTokens = null;
  cachedTokensAt = 0;
}

module.exports = {
  RAYDIUM_KNOWN_MINTS,
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