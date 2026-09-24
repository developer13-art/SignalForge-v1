/**
 * Password Validator
 *
 * @module client/src/lib/validators/password.validator
 */

const MIN_LENGTH = 8;
const MAX_LENGTH = 128;

const COMMON_PASSWORDS = [
  'password',
  'password1',
  'password123',
  '12345678',
  '123456789',
  'qwerty123',
  'letmein',
  'welcome',
  'admin123',
  'signalforge',
];

export function hasLowercase(password) {
  return typeof password === 'string' && /[a-z]/.test(password);
}

export function hasUppercase(password) {
  return typeof password === 'string' && /[A-Z]/.test(password);
}

export function hasDigit(password) {
  return typeof password === 'string' && /\d/.test(password);
}

export function hasSpecial(password) {
  return typeof password === 'string' && /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password);
}

export function isCommonPassword(password) {
  if (!password || typeof password !== 'string') {
    return false;
  }
  return COMMON_PASSWORDS.includes(password.toLowerCase());
}

export function calculatePasswordStrength(password) {
  if (!password || typeof password !== 'string') {
    return { score: 0, level: 'none', feedback: [] };
  }

  const feedback = [];
  let score = 0;

  if (password.length >= MIN_LENGTH) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  if (hasLowercase(password)) score += 1;
  else feedback.push('Add a lowercase letter');
  if (hasUppercase(password)) score += 1;
  else feedback.push('Add an uppercase letter');
  if (hasDigit(password)) score += 1;
  else feedback.push('Add a digit');
  if (hasSpecial(password)) score += 1;
  else feedback.push('Add a special character');

  if (isCommonPassword(password)) {
    score = Math.max(0, score - 3);
    feedback.push('Password is too common');
  }

  const normalized = Math.min(100, Math.round((score / 7) * 100));

  let level = 'weak';
  if (normalized >= 85) level = 'very-strong';
  else if (normalized >= 70) level = 'strong';
  else if (normalized >= 50) level = 'moderate';

  return { score: normalized, level, feedback };
}

export function validatePassword(password, options = {}) {
  const errors = [];

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
    return { valid: false, errors };
  }

  if (password.length < MIN_LENGTH) {
    errors.push(`Password must be at least ${MIN_LENGTH} characters`);
  }

  if (password.length > MAX_LENGTH) {
    errors.push(`Password must not exceed ${MAX_LENGTH} characters`);
  }

  if (options.requireLowercase !== false && !hasLowercase(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (options.requireUppercase !== false && !hasUppercase(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (options.requireDigit !== false && !hasDigit(password)) {
    errors.push('Password must contain at least one digit');
  }

  if (options.requireSpecial !== false && !hasSpecial(password)) {
    errors.push('Password must contain at least one special character');
  }

  if (isCommonPassword(password)) {
    errors.push('Password is too common');
  }

  return { valid: errors.length === 0, errors };
}

export const passwordValidator = {
  hasLowercase,
  hasUppercase,
  hasDigit,
  hasSpecial,
  isCommonPassword,
  calculatePasswordStrength,
  validatePassword,
  MIN_LENGTH,
  MAX_LENGTH,
};