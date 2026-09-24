/**
 * Mask Utilities
 *
 * @module server/utils/mask.util
 */

const DEFAULT_MASK = '*';
const DEFAULT_VISIBLE_START = 2;
const DEFAULT_VISIBLE_END = 2;

export function maskString(value, options = {}) {
  if (value === null || value === undefined) {
    return null;
  }

  const str = String(value);
  const maskChar = options.maskChar || DEFAULT_MASK;
  const visibleStart = options.visibleStart ?? DEFAULT_VISIBLE_START;
  const visibleEnd = options.visibleEnd ?? DEFAULT_VISIBLE_END;

  if (str.length === 0) {
    return '';
  }

  if (str.length <= visibleStart + visibleEnd) {
    return maskChar.repeat(str.length);
  }

  const start = str.substring(0, visibleStart);
  const end = str.substring(str.length - visibleEnd);
  const middle = maskChar.repeat(str.length - visibleStart - visibleEnd);

  return `${start}${middle}${end}`;
}

export function maskEmail(email) {
  if (typeof email !== 'string' || !email.includes('@')) {
    return null;
  }
  const [local, domain] = email.split('@');
  if (local.length <= 2) {
    return `${DEFAULT_MASK.repeat(local.length)}@${domain}`;
  }
  const start = local.substring(0, 2);
  const masked = DEFAULT_MASK.repeat(Math.max(1, local.length - 2));
  return `${start}${masked}@${domain}`;
}

export function maskPhone(phone) {
  if (typeof phone !== 'string') {
    return null;
  }
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) {
    return DEFAULT_MASK.repeat(phone.length);
  }
  const lastFour = digits.substring(digits.length - 4);
  return `${DEFAULT_MASK.repeat(Math.max(0, phone.length - 4))}${lastFour}`;
}

export function maskWalletAddress(address, prefixLength = 4, suffixLength = 4) {
  if (typeof address !== 'string') {
    return null;
  }
  if (address.length <= prefixLength + suffixLength) {
    return DEFAULT_MASK.repeat(address.length);
  }
  const start = address.substring(0, prefixLength);
  const end = address.substring(address.length - suffixLength);
  return `${start}${DEFAULT_MASK.repeat(Math.min(8, address.length - prefixLength - suffixLength))}${end}`;
}

export function maskApiKey(key, visibleLength = 8) {
  if (typeof key !== 'string') {
    return null;
  }
  if (key.length <= visibleLength) {
    return DEFAULT_MASK.repeat(key.length);
  }
  return `${key.substring(0, visibleLength)}${DEFAULT_MASK.repeat(key.length - visibleLength)}`;
}

export function maskObject(object, keys, maskValue = '[REDACTED]') {
  if (!object || typeof object !== 'object') {
    return object;
  }

  const set = new Set((keys || []).map((k) => k.toLowerCase()));

  const walk = (value) => {
    if (value === null || value === undefined) {
      return value;
    }
    if (Array.isArray(value)) {
      return value.map(walk);
    }
    if (typeof value === 'object') {
      const result = {};
      for (const [k, v] of Object.entries(value)) {
        if (set.has(k.toLowerCase())) {
          result[k] = maskValue;
        } else {
          result[k] = walk(v);
        }
      }
      return result;
    }
    return value;
  };

  return walk(object);
}

export const maskUtil = {
  maskString,
  maskEmail,
  maskPhone,
  maskWalletAddress,
  maskApiKey,
  maskObject,
};