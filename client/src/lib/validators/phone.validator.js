/**
 * Phone Validator
 *
 * @module client/src/lib/validators/phone.validator
 */

const E164_REGEX = /^\+[1-9]\d{1,14}$/;

export function stripFormatting(phone) {
  if (!phone || typeof phone !== 'string') {
    return '';
  }
  return phone.replace(/[\s\-().]/g, '');
}

export function isValidE164(phone) {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  return E164_REGEX.test(phone.trim());
}

export function normalizePhone(phone, defaultCountryCode = null) {
  if (!phone || typeof phone !== 'string') {
    return null;
  }

  const stripped = stripFormatting(phone);

  if (stripped.startsWith('+')) {
    return E164_REGEX.test(stripped) ? stripped : null;
  }

  if (stripped.startsWith('00')) {
    const international = `+${stripped.substring(2)}`;
    return E164_REGEX.test(international) ? international : null;
  }

  if (defaultCountryCode) {
    const digits = stripped.replace(/^0+/, '');
    const candidate = `+${defaultCountryCode}${digits}`;
    return E164_REGEX.test(candidate) ? candidate : null;
  }

  return null;
}

export function validatePhone(phone, defaultCountryCode = null) {
  const errors = [];

  if (!phone || typeof phone !== 'string') {
    errors.push('Phone number is required');
    return { valid: false, errors };
  }

  const normalized = normalizePhone(phone, defaultCountryCode);

  if (!normalized) {
    errors.push('Please enter a valid phone number');
    return { valid: false, errors };
  }

  return { valid: true, errors, normalized };
}

export function formatPhoneForDisplay(phone) {
  if (!phone || typeof phone !== 'string') {
    return '—';
  }
  return phone.trim();
}

export const phoneValidator = {
  stripFormatting,
  isValidE164,
  normalizePhone,
  validatePhone,
  formatPhoneForDisplay,
};