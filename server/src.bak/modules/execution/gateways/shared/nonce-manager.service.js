'use strict';

const crypto = require('crypto');

const { Connection, PublicKey } = require('@solana/web3.js');

const {
  SHARED_NONCE_STRATEGIES,
  SHARED_ERROR_CODES,
  SHARED_DEFAULTS,
} = require('./shared.constants');

const { config } = require('../../routers/execution-router.config');

/**
 * SignalForge - Shared Nonce Manager Service
 *
 * Provides recent blockhashes and, where applicable, durable nonce
 * accounts for Solana-based gateways. Durable nonces are used for
 * long-lived quotes so that a user can sign a transaction much later
 * without it expiring.
 */

class NonceError extends Error {
  constructor(message, code = SHARED_ERROR_CODES.INTERNAL_ERROR) {
    super(message);
    this.name = 'NonceError';
    this.code = code;
    this.isSharedDexError = true;
  }
}

let cachedConnection = null;

const BLOCKHASH_TTL_MS = 30000;
const blockhashCache = new Map();

function getConnection() {
  if (cachedConnection) {
    return cachedConnection;
  }

  const endpoint =
    process.env.SOLANA_RPC_URL ||
    (String(config.network || 'mainnet-beta').includes('devnet')
      ? 'https://api.devnet.solana.com'
      : 'https://api.mainnet-beta.solana.com');

  cachedConnection = new Connection(endpoint, config.commitment || 'confirmed');
  return cachedConnection;
}

async function fetchLatestBlockhash({ commitment = config.commitment || 'confirmed' } = {}) {
  const connection = getConnection();
  const result = await connection.getLatestBlockhash(commitment);
  if (!result || !result.blockhash) {
    throw new NonceError('Failed to fetch latest blockhash');
  }
  return {
    blockhash: result.blockhash,
    lastValidBlockHeight: result.lastValidBlockHeight,
    fetchedAt: Date.now(),
  };
}

async function getBlockhash({ cacheKey = 'default', forceRefresh = false } = {}) {
  const cached = blockhashCache.get(cacheKey);
  if (!forceRefresh && cached && Date.now() - cached.fetchedAt < BLOCKHASH_TTL_MS) {
    return cached;
  }
  const fresh = await fetchLatestBlockhash();
  blockhashCache.set(cacheKey, fresh);
  return fresh;
}

async function isBlockhashValid({ blockhash, lastValidBlockHeight } = {}) {
  if (!blockhash) {
    return false;
  }
  try {
    const connection = getConnection();
    const currentHeight = await connection.getBlockHeight(config.commitment || 'confirmed');
    if (lastValidBlockHeight && currentHeight > lastValidBlockHeight) {
      return false;
    }
    return true;
  } catch (_error) {
    return false;
  }
}

async function fetchNonceAccount({ nonceAccountAddress } = {}) {
  if (!nonceAccountAddress) {
    throw new NonceError('nonceAccountAddress is required');
  }
  const connection = getConnection();
  const publicKey = new PublicKey(nonceAccountAddress);
  const info = await connection.getAccountInfo(publicKey);
  if (!info) {
    throw new NonceError('Nonce account was not found', SHARED_ERROR_CODES.INVALID_REQUEST);
  }
  return {
    address: nonceAccountAddress,
    owner: info.owner.toBase58(),
    lamports: info.lamports,
  };
}

function generateNonceKey() {
  return `nonce_${crypto.randomBytes(10).toString('hex')}`;
}

function invalidateBlockhashCache(cacheKey) {
  if (cacheKey) {
    blockhashCache.delete(cacheKey);
    return;
  }
  blockhashCache.clear();
}

function describeNonceStrategy(strategy) {
  if (Object.values(SHARED_NONCE_STRATEGIES).includes(strategy)) {
    return strategy;
  }
  return SHARED_NONCE_STRATEGIES.LATEST_BLOCKHASH;
}

async function acquireNonce({
  strategy = SHARED_NONCE_STRATEGIES.LATEST_BLOCKHASH,
  cacheKey = 'default',
  durableNonceAccount,
} = {}) {
  const resolvedStrategy = describeNonceStrategy(strategy);

  if (resolvedStrategy === SHARED_NONCE_STRATEGIES.DURABLE_NONCE) {
    if (!durableNonceAccount) {
      throw new NonceError(
        'durableNonceAccount is required for durable nonce strategy',
        SHARED_ERROR_CODES.INVALID_REQUEST,
      );
    }
    const info = await fetchNonceAccount({ nonceAccountAddress: durableNonceAccount });
    return {
      strategy: resolvedStrategy,
      nonceAccount: info,
      acquiredAt: Date.now(),
    };
  }

  const blockhash = await getBlockhash({ cacheKey });
  return {
    strategy: resolvedStrategy,
    blockhash: blockhash.blockhash,
    lastValidBlockHeight: blockhash.lastValidBlockHeight,
    acquiredAt: blockhash.fetchedAt,
  };
}

function clearConnection() {
  cachedConnection = null;
  blockhashCache.clear();
}

module.exports = {
  NonceError,
  getConnection,
  fetchLatestBlockhash,
  getBlockhash,
  isBlockhashValid,
  fetchNonceAccount,
  generateNonceKey,
  invalidateBlockhashCache,
  describeNonceStrategy,
  acquireNonce,
  clearConnection,
  BLOCKHASH_TTL_MS,
  DEFAULT_COMMITMENT: SHARED_DEFAULTS.CONFIRMATION_TIMEOUT_MS,
};