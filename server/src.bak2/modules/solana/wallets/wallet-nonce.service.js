/**
 * Wallet Nonce Service
 *
 * Manages per-wallet nonces used for SIWS (Sign-In With Solana)
 * verification. Nonces are stored in memory with TTL and are
 * consumed once on successful verification.
 *
 * @module server/modules/solana/wallets/wallet-nonce.service
 */
const crypto = require('node:crypto');
const { AppError } = require('../../../lib/errors/app-error');
const { ERROR_CODES } = require('../../../lib/errors/error-codes');
const { logger } = require('../../../lib/logger');

const NONCE_TTL_MS = 5 * 60 * 1000;
const NONCES = new Map();

function pruneExpired() {
  const now = Date.now();
  for (const [key, entry] of NONCES.entries()) {
    if (entry.expiresAt <= now) {
      NONCES.delete(key);
    }
  }
}

function buildKey({ walletAddress }) {
  return String(walletAddress).trim();
}
function generateNonce({ walletAddress }) {
  if (!walletAddress) {
    throw new AppError('walletAddress is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  pruneExpired();

  const nonce = crypto.randomBytes(16).toString('base64url');
  const key = buildKey({ walletAddress });

  NONCES.set(key, {
    nonce,
    expiresAt: Date.now() + NONCE_TTL_MS,
    consumed: false,
  });

  logger.debug({ walletAddress }, 'Nonce generated for SIWS');

  return { nonce, expiresInMs: NONCE_TTL_MS };
}
function consumeNonce({ walletAddress, nonce }) {
  if (!walletAddress || !nonce) {
    throw new AppError('walletAddress and nonce are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  pruneExpired();

  const key = buildKey({ walletAddress });
  const entry = NONCES.get(key);

  if (!entry) {
    return { valid: false, reason: 'NO_NONCE' };
  }

  if (entry.expiresAt <= Date.now()) {
    NONCES.delete(key);
    return { valid: false, reason: 'NONCE_EXPIRED' };
  }

  if (entry.consumed) {
    return { valid: false, reason: 'NONCE_ALREADY_CONSUMED' };
  }

  if (entry.nonce !== nonce) {
    return { valid: false, reason: 'NONCE_MISMATCH' };
  }

  entry.consumed = true;
  NONCES.delete(key);

  return { valid: true };
}
function clearNonce({ walletAddress }) {
  if (!walletAddress) {
    return { cleared: false };
  }
  return { cleared: NONCES.delete(buildKey({ walletAddress })) };
}
function clearAll() {
  NONCES.clear();
}
const walletNonceService = {
  generateNonce,
  consumeNonce,
  clearNonce,
  clearAll,
  NONCE_TTL_MS,
};
module.exports.walletNonceService = walletNonceService;
module.exports.generateNonce = generateNonce;
module.exports.consumeNonce = consumeNonce;
module.exports.clearNonce = clearNonce;
module.exports.clearAll = clearAll;
