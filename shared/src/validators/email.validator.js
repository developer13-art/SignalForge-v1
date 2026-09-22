/**
 * Email Validator
 *
 * Provides validation for email addresses used across the SignalForge
 * platform. Uses a stricter RFC 5322-compatible subset suitable for
 * user registration, login, and notification delivery.
 *
 * @module @signalforge/shared/validators/email
 */

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const MAX_EMAIL_LENGTH = 254;
const MAX_LOCAL_PART_LENGTH = 64;
const MAX_DOMAIN_LENGTH = 253;

const DISPOSABLE_DOMAINS = Object.freeze([
  'mailinator.com',
  'tempmail.com',
  'temp-mail.org',
  '10minutemail.com',
  'guerrillamail.com',
  'throwawaymail.com',
  'yopmail.com',
  'trashmail.com',
  'sharklasers.com',
  'getnada.com',
  'maildrop.cc',
  'fakeinbox.com',
  'dispostable.com',
  'mytemp.email',
  'tempinbox.com',
  'spamgourmet.com',
]);

export function isValidEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const trimmed = email.trim();

  if (trimmed.length === 0 || trimmed.length > MAX_EMAIL_LENGTH) {
    return false;
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return false;
  }

  const atIndex = trimmed.lastIndexOf('@');
  const localPart = trimmed.substring(0, atIndex);
  const domain = trimmed.substring(atIndex + 1);

  if (localPart.length === 0 || localPart.length > MAX_LOCAL_PART_LENGTH) {
    return false;
  }

  if (domain.length === 0 || domain.length > MAX_DOMAIN_LENGTH) {
    return false;
  }

  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return false;
  }

  if (localPart.includes('..')) {
    return false;
  }

  if (domain.startsWith('.') || domain.endsWith('.')) {
    return false;
  }

  if (domain.includes('..')) {
    return false;
  }

  return true;
}

export function normalizeEmail(email) {
  if (!email || typeof email !== 'string') {
    return null;
  }
  return email.trim().toLowerCase();
}

export function isDisposableEmail(email) {
  if (!isValidEmail(email)) {
    return false;
  }
  const normalized = normalizeEmail(email);
  const atIndex = normalized.lastIndexOf('@');
  const domain = normalized.substring(atIndex + 1);
  return DISPOSABLE_DOMAINS.includes(domain);
}

export function getEmailDomain(email) {
  if (!isValidEmail(email)) {
    return null;
  }
  const normalized = normalizeEmail(email);
  const atIndex = normalized.lastIndexOf('@');
  return normalized.substring(atIndex + 1);
}

export function getEmailLocalPart(email) {
  if (!isValidEmail(email)) {
    return null;
  }
  const normalized = normalizeEmail(email);
  const atIndex = normalized.lastIndexOf('@');
  return normalized.substring(0, atIndex);
}

export function validateEmail(email, options = {}) {
  const errors = [];

  if (!email || typeof email !== 'string') {
    return { valid: false, errors: ['Email is required'] };
  }

  if (!isValidEmail(email)) {
    return { valid: false, errors: ['Email format is invalid'] };
  }

  if (options.rejectDisposable && isDisposableEmail(email)) {
    errors.push('Disposable email addresses are not permitted');
  }

  if (options.allowedDomains && Array.isArray(options.allowedDomains)) {
    const domain = getEmailDomain(email);
    if (!options.allowedDomains.includes(domain)) {
      errors.push('Email domain is not permitted');
    }
  }

  if (options.blockedDomains && Array.isArray(options.blockedDomains)) {
    const domain = getEmailDomain(email);
    if (options.blockedDomains.includes(domain)) {
      errors.push('Email domain is not permitted');
    }
  }

  return { valid: errors.length === 0, errors };
}

export const EMAIL_CONSTRAINTS = Object.freeze({
  maxLength: MAX_EMAIL_LENGTH,
  maxLocalPartLength: MAX_LOCAL_PART_LENGTH,
  maxDomainLength: MAX_DOMAIN_LENGTH,
});