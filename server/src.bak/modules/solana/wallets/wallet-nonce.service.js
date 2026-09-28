/**
 * Wallet Nonce Service
 *
 * Manages per-wallet nonces used for SIWS (Sign-In With Solana)
 * verification. Nonces are stored in memory with TTL and are
 * consumed once on successful verification.
 *
 * @module server/modules/solana/wallets/wallet-nonce.service
 */

import crypto from 'node:crypto';
import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';

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

export function generateNonce({ walletAddress }) {
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

export function consumeNonce({ walletAddress, nonce }) {
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

export function clearNonce({ walletAddress }) {
  if (!walletAddress) {
    return { cleared: false };
  }
  return { cleared: NONCES.delete(buildKey({ walletAddress })) };
}

export function clearAll() {
  NONCES.clear();
}

export const walletNonceService = {
  generateNonce,
  consumeNonce,
  clearNonce,
  clearAll,
  NONCE_TTL_MS,
};