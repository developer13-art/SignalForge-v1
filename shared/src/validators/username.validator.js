/**
 * Username Validator
 *
 * Provides validation for usernames used across the SignalForge platform.
 * Usernames are used in public profiles, provider listings, and URLs.
 *
 * @module @signalforge/shared/validators/username
 */

const USERNAME_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9_-]{2,29}$/;

const MIN_USERNAME_LENGTH = 3;
const MAX_USERNAME_LENGTH = 30;

const RESERVED_USERNAMES = Object.freeze([
  'admin',
  'administrator',
  'root',
  'system',
  'support',
  'help',
  'moderator',
  'mod',
  'staff',
  'team',
  'official',
  'signalforge',
  'signal',
  'forge',
  'api',
  'app',
  'www',
  'mail',
  'smtp',
  'webmaster',
  'postmaster',
  'noreply',
  'no-reply',
  'security',
  'billing',
  'payments',
  'kyc',
  'compliance',
  'legal',
  'terms',
  'privacy',
  'settings',
  'account',
  'profile',
  'login',
  'logout',
  'register',
  'signup',
  'signin',
  'dashboard',
  'trades',
  'signals',
  'providers',
  'traders',
  'marketplace',
  'referrals',
  'wallet',
  'withdrawals',
  'subscriptions',
  'solana',
]);

export function isValidUsername(username) {
  if (!username || typeof username !== 'string') {
    return false;
  }
  return USERNAME_REGEX.test(username);
}

export function isReservedUsername(username) {
  if (!username || typeof username !== 'string') {
    return false;
  }
  return RESERVED_USERNAMES.includes(username.toLowerCase());
}

export function normalizeUsername(username) {
  if (!username || typeof username !== 'string') {
    return null;
  }
  return username.trim();
}

export function hasConfusingCharacters(username) {
  if (!username || typeof username !== 'string') {
    return false;
  }
  const lower = username.toLowerCase();
  if (lower.includes('0o') || lower.includes('o0')) {
    return true;
  }
  if (lower.includes('1l') || lower.includes('l1')) {
    return true;
  }
  if (lower.includes('rn') || lower.includes('vv')) {
    return true;
  }
  return false;
}

export function validateUsername(username, options = {}) {
  const errors = [];

  const minLength = options.minLength || MIN_USERNAME_LENGTH;
  const maxLength = options.maxLength || MAX_USERNAME_LENGTH;

  if (!username || typeof username !== 'string') {
    return { valid: false, errors: ['Username is required'] };
  }

  const trimmed = username.trim();

  if (trimmed.length < minLength) {
    errors.push(`Username must be at least ${minLength} characters`);
  }

  if (trimmed.length > maxLength) {
    errors.push(`Username must not exceed ${maxLength} characters`);
  }

  if (!USERNAME_REGEX.test(trimmed)) {
    errors.push(
      'Username may only contain letters, numbers, hyphens, and underscores, and must start with a letter or number',
    );
  }

  if (options.rejectReserved !== false && isReservedUsername(trimmed)) {
    errors.push('This username is reserved');
  }

  if (options.rejectConfusing && hasConfusingCharacters(trimmed)) {
    errors.push('Username contains confusing characters');
  }

  if (options.blockedUsernames && Array.isArray(options.blockedUsernames)) {
    if (options.blockedUsernames.includes(trimmed.toLowerCase())) {
      errors.push('This username is not permitted');
    }
  }

  return { valid: errors.length === 0, errors };
}

export const USERNAME_CONSTRAINTS = Object.freeze({
  minLength: MIN_USERNAME_LENGTH,
  maxLength: MAX_USERNAME_LENGTH,
  pattern: USERNAME_REGEX.source,
  reservedCount: RESERVED_USERNAMES.length,
});