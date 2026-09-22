/**
 * Password Validator
 *
 * Provides password strength validation for the SignalForge platform.
 * Enforces minimum length, character classes, and common-password
 * rejection.
 *
 * @module @signalforge/shared/validators/password
 */

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

const COMMON_PASSWORDS = Object.freeze([
  'password',
  'password1',
  'password123',
  '12345678',
  '123456789',
  '1234567890',
  'qwerty123',
  'qwertyuiop',
  'letmein',
  'welcome',
  'welcome1',
  'admin',
  'admin123',
  'administrator',
  'root',
  'toor',
  'abc12345',
  'iloveyou',
  'monkey123',
  'dragon123',
  'football',
  'baseball',
  'sunshine',
  'princess',
  'login123',
  'passw0rd',
  'p@ssword',
  'p@ssw0rd',
  'trustno1',
  'changeme',
  'signalforge',
  'trading123',
  'forex123',
  'metatrader',
]);

const LOWERCASE_REGEX = /[a-z]/;
const UPPERCASE_REGEX = /[A-Z]/;
const DIGIT_REGEX = /\d/;
const SPECIAL_REGEX = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/;

export function hasLowercase(password) {
  return typeof password === 'string' && LOWERCASE_REGEX.test(password);
}

export function hasUppercase(password) {
  return typeof password === 'string' && UPPERCASE_REGEX.test(password);
}

export function hasDigit(password) {
  return typeof password === 'string' && DIGIT_REGEX.test(password);
}

export function hasSpecial(password) {
  return typeof password === 'string' && SPECIAL_REGEX.test(password);
}

export function isCommonPassword(password) {
  if (!password || typeof password !== 'string') {
    return false;
  }
  return COMMON_PASSWORDS.includes(password.toLowerCase());
}

export function hasRepeatingCharacters(password, maxRepeats = 3) {
  if (!password || typeof password !== 'string') {
    return false;
  }
  let repeatCount = 1;
  for (let i = 1; i < password.length; i++) {
    if (password[i] === password[i - 1]) {
      repeatCount++;
      if (repeatCount > maxRepeats) {
        return true;
      }
    } else {
      repeatCount = 1;
    }
  }
  return false;
}

export function hasSequentialCharacters(password, sequenceLength = 4) {
  if (!password || typeof password !== 'string' || password.length < sequenceLength) {
    return false;
  }

  for (let i = 0; i <= password.length - sequenceLength; i++) {
    const slice = password.substring(i, i + sequenceLength);
    let isSequentialAsc = true;
    let isSequentialDesc = true;

    for (let j = 1; j < slice.length; j++) {
      const prev = slice.charCodeAt(j - 1);
      const curr = slice.charCodeAt(j);
      if (curr - prev !== 1) {
        isSequentialAsc = false;
      }
      if (prev - curr !== 1) {
        isSequentialDesc = false;
      }
    }

    if (isSequentialAsc || isSequentialDesc) {
      return true;
    }
  }

  return false;
}

export function calculatePasswordStrength(password) {
  if (!password || typeof password !== 'string') {
    return { score: 0, level: 'none', feedback: [] };
  }

  const feedback = [];
  let score = 0;

  if (password.length >= MIN_PASSWORD_LENGTH) {
    score += 1;
  } else {
    feedback.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }

  if (password.length >= 12) {
    score += 1;
  }

  if (password.length >= 16) {
    score += 1;
  }

  if (hasLowercase(password)) {
    score += 1;
  } else {
    feedback.push('Add at least one lowercase letter');
  }

  if (hasUppercase(password)) {
    score += 1;
  } else {
    feedback.push('Add at least one uppercase letter');
  }

  if (hasDigit(password)) {
    score += 1;
  } else {
    feedback.push('Add at least one digit');
  }

  if (hasSpecial(password)) {
    score += 1;
  } else {
    feedback.push('Add at least one special character');
  }

  if (isCommonPassword(password)) {
    score = Math.max(0, score - 3);
    feedback.push('This password is too common');
  }

  if (hasRepeatingCharacters(password)) {
    score = Math.max(0, score - 1);
    feedback.push('Avoid repeating characters');
  }

  if (hasSequentialCharacters(password)) {
    score = Math.max(0, score - 1);
    feedback.push('Avoid sequential characters');
  }

  const normalizedScore = Math.min(100, Math.max(0, Math.round((score / 7) * 100)));

  let level = 'weak';
  if (normalizedScore >= 85) {
    level = 'very-strong';
  } else if (normalizedScore >= 70) {
    level = 'strong';
  } else if (normalizedScore >= 50) {
    level = 'moderate';
  }

  return { score: normalizedScore, level, feedback };
}

export function validatePassword(password, options = {}) {
  const errors = [];

  const minLength = options.minLength || MIN_PASSWORD_LENGTH;
  const maxLength = options.maxLength || MAX_PASSWORD_LENGTH;

  if (!password || typeof password !== 'string') {
    return { valid: false, errors: ['Password is required'] };
  }

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters`);
  }

  if (password.length > maxLength) {
    errors.push(`Password must not exceed ${maxLength} characters`);
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

  if (options.rejectCommon !== false && isCommonPassword(password)) {
    errors.push('Password is too common');
  }

  if (options.rejectRepeating !== false && hasRepeatingCharacters(password)) {
    errors.push('Password contains too many repeating characters');
  }

  if (options.rejectSequential !== false && hasSequentialCharacters(password)) {
    errors.push('Password contains sequential characters');
  }

  return { valid: errors.length === 0, errors };
}

export const PASSWORD_CONSTRAINTS = Object.freeze({
  minLength: MIN_PASSWORD_LENGTH,
  maxLength: MAX_PASSWORD_LENGTH,
  requireLowercase: true,
  requireUppercase: true,
  requireDigit: true,
  requireSpecial: true,
});