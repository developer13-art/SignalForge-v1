/**
 * Wallet Validator
 *
 * @module client/src/lib/validators/wallet.validator
 */

const BASE58_REGEX = /^[1-9A-HJ-NP-Za-km-z]+$/;
const MIN_LENGTH = 32;
const MAX_LENGTH = 44;

export function isValidSolanaAddress(address) {
  if (!address || typeof address !== 'string') {
    return false;
  }
  const trimmed = address.trim();
  if (trimmed.length < MIN_LENGTH || trimmed.length > MAX_LENGTH) {
    return false;
  }
  return BASE58_REGEX.test(trimmed);
}

export function isValidTxSignature(signature) {
  if (!signature || typeof signature !== 'string') {
    return false;
  }
  const trimmed = signature.trim();
  if (trimmed.length < 80 || trimmed.length > 88) {
    return false;
  }
  return BASE58_REGEX.test(trimmed);
}

export function normalizeSolanaAddress(address) {
  if (!isValidSolanaAddress(address)) {
    return null;
  }
  return address.trim();
}

export function shortenAddress(address, prefixLength = 4, suffixLength = 4) {
  if (!isValidSolanaAddress(address)) {
    return '—';
  }
  const trimmed = address.trim();
  if (trimmed.length <= prefixLength + suffixLength + 3) {
    return trimmed;
  }
  return `${trimmed.substring(0, prefixLength)}...${trimmed.substring(trimmed.length - suffixLength)}`;
}

export function validateWalletAddress(address) {
  const errors = [];

  if (!address || typeof address !== 'string') {
    errors.push('Wallet address is required');
    return { valid: false, errors };
  }

  if (!isValidSolanaAddress(address)) {
    errors.push('Please enter a valid Solana wallet address');
  }

  return { valid: errors.length === 0, errors, normalized: isValidSolanaAddress(address) ? address.trim() : null };
}

export const walletValidator = {
  isValidSolanaAddress,
  isValidTxSignature,
  normalizeSolanaAddress,
  shortenAddress,
  validateWalletAddress,
};