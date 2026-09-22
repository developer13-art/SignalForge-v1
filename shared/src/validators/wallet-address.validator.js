/**
 * Solana Wallet Address Validator
 *
 * Provides validation for Solana wallet addresses, including
 * base58 format validation and program-derived address (PDA)
 * validation patterns.
 *
 * @module @signalforge/shared/validators/wallet-address
 */

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const BASE58_REGEX = /^[1-9A-HJ-NP-Za-km-z]+$/;

const SOLANA_ADDRESS_LENGTH = 44;
const MIN_ADDRESS_LENGTH = 32;
const MAX_ADDRESS_LENGTH = 44;

export function isValidBase58(address) {
  if (!address || typeof address !== 'string') {
    return false;
  }
  return BASE58_REGEX.test(address);
}

export function isValidSolanaAddress(address) {
  if (!address || typeof address !== 'string') {
    return false;
  }

  const trimmed = address.trim();

  if (
    trimmed.length < MIN_ADDRESS_LENGTH ||
    trimmed.length > MAX_ADDRESS_LENGTH
  ) {
    return false;
  }

  if (!BASE58_REGEX.test(trimmed)) {
    return false;
  }

  return true;
}

export function validateSolanaAddress(address, options = {}) {
  const errors = [];

  if (!address || typeof address !== 'string') {
    return { valid: false, errors: ['Wallet address is required'] };
  }

  const trimmed = address.trim();

  if (trimmed.length === 0) {
    errors.push('Wallet address must not be empty');
  }

  if (trimmed.length < MIN_ADDRESS_LENGTH) {
    errors.push(`Wallet address must be at least ${MIN_ADDRESS_LENGTH} characters`);
  }

  if (trimmed.length > MAX_ADDRESS_LENGTH) {
    errors.push(`Wallet address must not exceed ${MAX_ADDRESS_LENGTH} characters`);
  }

  if (!BASE58_REGEX.test(trimmed)) {
    const invalidChars = [...trimmed].filter(
      (char) => !BASE58_ALPHABET.includes(char),
    );
    if (invalidChars.length > 0) {
      errors.push(`Wallet address contains invalid base58 characters: ${[...new Set(invalidChars)].join(', ')}`);
    } else {
      errors.push('Wallet address contains invalid characters');
    }
  }

  if (options.blocked && Array.isArray(options.blocked)) {
    if (options.blocked.includes(trimmed)) {
      errors.push('Wallet address is blocked');
    }
  }

  if (options.allowed && Array.isArray(options.allowed)) {
    if (!options.allowed.includes(trimmed)) {
      errors.push('Wallet address is not in the allowed list');
    }
  }

  return { valid: errors.length === 0, errors, normalized: trimmed };
}

export function normalizeSolanaAddress(address) {
  if (!isValidSolanaAddress(address)) {
    return null;
  }
  return address.trim();
}

export function areSameWallet(addressA, addressB) {
  const a = normalizeSolanaAddress(addressA);
  const b = normalizeSolanaAddress(addressB);
  if (!a || !b) {
    return false;
  }
  return a === b;
}

export function shortenAddress(address, prefixLength = 4, suffixLength = 4) {
  if (!isValidSolanaAddress(address)) {
    return null;
  }
  const trimmed = address.trim();
  if (trimmed.length <= prefixLength + suffixLength + 3) {
    return trimmed;
  }
  return `${trimmed.substring(0, prefixLength)}...${trimmed.substring(trimmed.length - suffixLength)}`;
}

export function isValidTokenMint(mint) {
  return isValidSolanaAddress(mint);
}

export function isValidProgramId(programId) {
  return isValidSolanaAddress(programId);
}

export const SOLANA_ADDRESS_CONSTRAINTS = Object.freeze({
  minLength: MIN_ADDRESS_LENGTH,
  maxLength: MAX_ADDRESS_LENGTH,
  typicalLength: SOLANA_ADDRESS_LENGTH,
  alphabet: BASE58_ALPHABET,
});