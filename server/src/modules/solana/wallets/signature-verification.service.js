/**
 * Signature Verification Service
 *
 * Verifies Solana wallet signatures produced by SIWS flows. Uses
 * tweetnacl (via the platform's crypto utilities) to verify Ed25519
 * signatures against the base58-encoded public key.
 *
 * @module server/modules/solana/wallets/signature-verification.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';

let bs58Module = null;
let naclModule = null;

async function loadBs58() {
  if (bs58Module) {
    return bs58Module;
  }
  try {
    const module = await import('bs58');
    bs58Module = module.default || module;
    return bs58Module;
  } catch (err) {
    logger.warn({ err }, 'bs58 library is not available');
    throw new AppError('bs58 library is not available', ERROR_CODES.CONFIGURATION_MISSING, 500);
  }
}

async function loadNacl() {
  if (naclModule) {
    return naclModule;
  }
  try {
    const module = await import('tweetnacl');
    naclModule = module.default || module;
    return naclModule;
  } catch (err) {
    logger.warn({ err }, 'tweetnacl library is not available');
    throw new AppError('tweetnacl library is not available', ERROR_CODES.CONFIGURATION_MISSING, 500);
  }
}

export async function verifySignature({
  message,
  signatureBase58,
  publicKeyBase58,
}) {
  if (!message || !signatureBase58 || !publicKeyBase58) {
    throw new AppError(
      'message, signatureBase58, and publicKeyBase58 are required',
      ERROR_CODES.VALIDATION_FAILED,
      400,
    );
  }

  const bs58 = await loadBs58();
  const nacl = await loadNacl();

  let messageBytes;
  if (typeof message === 'string') {
    messageBytes = new TextEncoder().encode(message);
  } else if (Buffer.isBuffer(message)) {
    messageBytes = new Uint8Array(message);
  } else {
    throw new AppError('message must be a string or Buffer', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  let signatureBytes;
  let publicKeyBytes;

  try {
    signatureBytes = bs58.decode(signatureBase58);
  } catch (err) {
    return { valid: false, reason: 'INVALID_SIGNATURE_ENCODING' };
  }

  try {
    publicKeyBytes = bs58.decode(publicKeyBase58);
  } catch (err) {
    return { valid: false, reason: 'INVALID_PUBLIC_KEY_ENCODING' };
  }

  if (signatureBytes.length !== 64) {
    return { valid: false, reason: 'INVALID_SIGNATURE_LENGTH' };
  }

  if (publicKeyBytes.length !== 32) {
    return { valid: false, reason: 'INVALID_PUBLIC_KEY_LENGTH' };
  }

  try {
    const isValid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
    return { valid: isValid, reason: isValid ? null : 'SIGNATURE_MISMATCH' };
  } catch (err) {
    logger.warn({ err }, 'Signature verification threw an error');
    return { valid: false, reason: 'VERIFICATION_ERROR' };
  }
}

export async function verifyWalletOwnership({
  walletAddress,
  message,
  signatureBase58,
}) {
  return verifySignature({
    message,
    signatureBase58,
    publicKeyBase58: walletAddress,
  });
}

export const signatureVerificationService = {
  verifySignature,
  verifyWalletOwnership,
};