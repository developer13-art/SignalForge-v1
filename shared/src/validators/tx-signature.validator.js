/**
 * Solana Transaction Signature Validator
 *
 * Provides validation for Solana transaction signatures in base58
 * format. Signatures are 64 bytes encoded as base58, producing a
 * 87 or 88 character string.
 *
 * @module @signalforge/shared/validators/tx-signature
 */

const BASE58_REGEX = /^[1-9A-HJ-NP-Za-km-z]+$/;

const MIN_SIGNATURE_LENGTH = 80;
const MAX_SIGNATURE_LENGTH = 88;

export function isValidTxSignature(signature) {
  if (!signature || typeof signature !== 'string') {
    return false;
  }

  const trimmed = signature.trim();

  if (
    trimmed.length < MIN_SIGNATURE_LENGTH ||
    trimmed.length > MAX_SIGNATURE_LENGTH
  ) {
    return false;
  }

  if (!BASE58_REGEX.test(trimmed)) {
    return false;
  }

  return true;
}

export function validateTxSignature(signature, options = {}) {
  const errors = [];

  if (!signature || typeof signature !== 'string') {
    return { valid: false, errors: ['Transaction signature is required'] };
  }

  const trimmed = signature.trim();

  if (trimmed.length === 0) {
    errors.push('Transaction signature must not be empty');
  }

  if (trimmed.length < MIN_SIGNATURE_LENGTH) {
    errors.push(`Transaction signature must be at least ${MIN_SIGNATURE_LENGTH} characters`);
  }

  if (trimmed.length > MAX_SIGNATURE_LENGTH) {
    errors.push(`Transaction signature must not exceed ${MAX_SIGNATURE_LENGTH} characters`);
  }

  if (!BASE58_REGEX.test(trimmed)) {
    errors.push('Transaction signature contains invalid base58 characters');
  }

  if (options.blocked && Array.isArray(options.blocked)) {
    if (options.blocked.includes(trimmed)) {
      errors.push('Transaction signature is blocked');
    }
  }

  return { valid: errors.length === 0, errors, normalized: trimmed };
}

export function normalizeTxSignature(signature) {
  if (!isValidTxSignature(signature)) {
    return null;
  }
  return signature.trim();
}

export function areSameTxSignature(sigA, sigB) {
  const a = normalizeTxSignature(sigA);
  const b = normalizeTxSignature(sigB);
  if (!a || !b) {
    return false;
  }
  return a === b;
}

export function shortenTxSignature(signature, prefixLength = 8, suffixLength = 8) {
  if (!isValidTxSignature(signature)) {
    return null;
  }
  const trimmed = signature.trim();
  return `${trimmed.substring(0, prefixLength)}...${trimmed.substring(trimmed.length - suffixLength)}`;
}

export function getSolanaExplorerUrl(signature, network = 'devnet') {
  if (!isValidTxSignature(signature)) {
    return null;
  }

  const baseUrl = 'https://explorer.solana.com/tx';
  const trimmed = signature.trim();

  let networkParam = '';
  if (network === 'mainnet-beta' || network === 'mainnet') {
    networkParam = '';
  } else {
    networkParam = `?cluster=${network}`;
  }

  return `${baseUrl}/${trimmed}${networkParam}`;
}

export const TX_SIGNATURE_CONSTRAINTS = Object.freeze({
  minLength: MIN_SIGNATURE_LENGTH,
  maxLength: MAX_SIGNATURE_LENGTH,
});