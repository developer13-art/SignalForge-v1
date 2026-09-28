'use strict';

const { Connection, PublicKey } = require('@solana/web3.js');

const {
  ACTIONS_SUPPORTED_MINTS,
  ACTIONS_TOKEN_DECIMALS,
  ACTIONS_DEFAULT_TOKEN_DECIMALS,
} = require('../actions.constants');

const { config } = require('../actions.config');
const { UnsupportedTokenError, ServiceUnavailableError } = require('../actions.errors');
const actionsValidator = require('../actions.validator');

/**
 * SignalForge - Token Resolver Service
 *
 * Resolves the mint, decimals, and symbol for a given token request.
 * Uses a static registry as the source of truth for decimals to avoid
 * extra RPC round trips, but will fall back to on-chain lookups when
 * the token is not present in the registry and the caller has enabled
 * dynamic resolution.
 */

const SYMBOL_TO_MINT = Object.freeze({
  USDC_MAINNET: ACTIONS_SUPPORTED_MINTS.USDC_MAINNET,
  USDC_DEVNET: ACTIONS_SUPPORTED_MINTS.USDC_DEVNET,
  USDT: ACTIONS_SUPPORTED_MINTS.USDT_MAINNET,
  SOL: ACTIONS_SUPPORTED_MINTS.SOL_WRAPPED_MAINNET,
  JUP: ACTIONS_SUPPORTED_MINTS.JUP_MAINNET,
  BONK: ACTIONS_SUPPORTED_MINTS.BONK_MAINNET,
  PYTH: ACTIONS_SUPPORTED_MINTS.PYTH_MAINNET,
  RAY: ACTIONS_SUPPORTED_MINTS.RAY_MAINNET,
  ORCA: ACTIONS_SUPPORTED_MINTS.ORCA_MAINNET,
});

let cachedConnection = null;

function getConnection() {
  if (cachedConnection) {
    return cachedConnection;
  }
  if (!config.enabled) {
    throw new ServiceUnavailableError('Solana Actions are disabled');
  }
  const endpoint =
    process.env.SOLANA_RPC_URL ||
    (String(config.network).includes('devnet')
      ? 'https://api.devnet.solana.com'
      : 'https://api.mainnet-beta.solana.com');

  cachedConnection = new Connection(endpoint, config.commitment || 'confirmed');
  return cachedConnection;
}

function isDevnet() {
  return String(config.network || '').toLowerCase().includes('devnet');
}

function resolveMintForSymbol(symbol) {
  const normalized = String(symbol || '').toUpperCase();
  if (normalized === 'USDC') {
    return isDevnet() ? SYMBOL_TO_MINT.USDC_DEVNET : SYMBOL_TO_MINT.USDC_MAINNET;
  }
  if (normalized === 'SOL') {
    return SYMBOL_TO_MINT.SOL;
  }
  const mint = SYMBOL_TO_MINT[normalized];
  if (!mint) {
    throw new UnsupportedTokenError(`No mint registered for symbol ${normalized}`, {
      symbol: normalized,
    });
  }
  return mint;
}

function resolveSymbolForMint(mint) {
  const normalized = String(mint || '').trim();
  for (const [symbol, value] of Object.entries(SYMBOL_TO_MINT)) {
    if (value === normalized) {
      if (symbol.startsWith('USDC')) {
        return 'USDC';
      }
      return symbol;
    }
  }
  return null;
}

function resolveStaticDecimals(symbol) {
  const normalized = String(symbol || '').toUpperCase();
  if (Object.prototype.hasOwnProperty.call(ACTIONS_TOKEN_DECIMALS, normalized)) {
    return ACTIONS_TOKEN_DECIMALS[normalized];
  }
  return ACTIONS_DEFAULT_TOKEN_DECIMALS;
}

async function fetchDecimalsFromChain(mintAddress) {
  const connection = getConnection();
  const publicKey = new PublicKey(mintAddress);
  const info = await connection.getParsedAccountInfo(publicKey);

  if (!info || !info.value || !info.value.data) {
    throw new UnsupportedTokenError('Token mint was not found on chain', {
      mint: mintAddress,
    });
  }

  const data = info.value.data;
  if (typeof data === 'object' && data.parsed && data.parsed.info && data.parsed.info.decimals !== undefined) {
    return Number(data.parsed.info.decimals);
  }

  throw new UnsupportedTokenError('Unable to determine token decimals', {
    mint: mintAddress,
  });
}

async function resolve({ symbol, mint, amountDecimals } = {}) {
  const allowedSymbols = config.token.allowedSymbols || [];

  let resolvedSymbol = null;
  let resolvedMint = null;
  let resolvedDecimals = null;

  if (symbol) {
    resolvedSymbol = actionsValidator.validateTokenSymbol(symbol, allowedSymbols);
    resolvedMint = resolveMintForSymbol(resolvedSymbol);
    resolvedDecimals = resolveStaticDecimals(resolvedSymbol);
  }

  if (mint) {
    resolvedMint = actionsValidator.validateTokenMint(mint);
    resolvedSymbol = resolveSymbolForMint(resolvedMint) || resolvedSymbol;
    if (resolvedSymbol) {
      resolvedDecimals = resolveStaticDecimals(resolvedSymbol);
    }
  }

  if (!resolvedMint && !resolvedSymbol) {
    resolvedSymbol = config.token.defaultSymbol;
    resolvedMint = resolveMintForSymbol(resolvedSymbol);
    resolvedDecimals = resolveStaticDecimals(resolvedSymbol);
  }

  if (Number.isInteger(amountDecimals) && amountDecimals >= 0) {
    resolvedDecimals = amountDecimals;
  } else if (resolvedDecimals === undefined || resolvedDecimals === null) {
    try {
      resolvedDecimals = await fetchDecimalsFromChain(resolvedMint);
    } catch (_error) {
      resolvedDecimals = ACTIONS_DEFAULT_TOKEN_DECIMALS;
    }
  }

  return {
    symbol: resolvedSymbol || 'UNKNOWN',
    mint: resolvedMint,
    decimals: resolvedDecimals,
  };
}

function toBaseUnits(amount, decimals) {
  if (typeof amount !== 'number' || Number.isNaN(amount)) {
    return 0;
  }
  const factor = Math.pow(10, decimals);
  return Math.round(amount * factor);
}

function fromBaseUnits(baseUnits, decimals) {
  if (!baseUnits) {
    return 0;
  }
  const factor = Math.pow(10, decimals);
  return Number(baseUnits) / factor;
}

function clearConnectionCache() {
  cachedConnection = null;
}

module.exports = {
  SYMBOL_TO_MINT,
  resolveMintForSymbol,
  resolveSymbolForMint,
  resolveStaticDecimals,
  resolve,
  fetchDecimalsFromChain,
  toBaseUnits,
  fromBaseUnits,
  getConnection,
  isDevnet,
  clearConnectionCache,
};