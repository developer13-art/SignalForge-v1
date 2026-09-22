/**
 * Mask Utilities
 *
 * Provides helpers for masking sensitive information in logs, UI
 * displays, and API responses.
 *
 * @module @signalforge/shared/utils/mask
 */

const DEFAULT_MASK_CHAR = '*';
const DEFAULT_VISIBLE_START = 2;
const DEFAULT_VISIBLE_END = 2;

export function maskString(value, options = {}) {
  if (value === null || value === undefined) {
    return null;
  }

  const str = String(value);
  const maskChar = options.maskChar ?? DEFAULT_MASK_CHAR;
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
  const maskLength = str.length - visibleStart - visibleEnd;

  return `${start}${maskChar.repeat(maskLength)}${end}`;
}

export function maskEmail(email) {
  if (typeof email !== 'string' || !email.includes('@')) {
    return null;
  }

  const atIndex = email.lastIndexOf('@');
  const localPart = email.substring(0, atIndex);
  const domain = email.substring(atIndex + 1);

  if (localPart.length <= 2) {
    return `${DEFAULT_MASK_CHAR.repeat(localPart.length)}@${domain}`;
  }

  const visibleStart = localPart.substring(0, 2);
  const maskLength = Math.max(1, localPart.length - 2);

  return `${visibleStart}${DEFAULT_MASK_CHAR.repeat(maskLength)}@${domain}`;
}

export function maskPhone(phone) {
  if (typeof phone !== 'string') {
    return null;
  }

  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) {
    return DEFAULT_MASK_CHAR.repeat(phone.length);
  }

  const lastFour = digits.substring(digits.length - 4);
  const prefixLength = phone.length - 4;

  return `${DEFAULT_MASK_CHAR.repeat(Math.max(0, prefixLength))}${lastFour}`;
}

export function maskCreditCard(cardNumber) {
  if (typeof cardNumber !== 'string') {
    return null;
  }

  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 4) {
    return DEFAULT_MASK_CHAR.repeat(cardNumber.length);
  }

  const lastFour = digits.substring(digits.length - 4);
  return `${DEFAULT_MASK_CHAR.repeat(digits.length - 4)}${lastFour}`;
}

export function maskWalletAddress(address, prefixLength = 4, suffixLength = 4) {
  if (typeof address !== 'string') {
    return null;
  }

  if (address.length <= prefixLength + suffixLength) {
    return DEFAULT_MASK_CHAR.repeat(address.length);
  }

  const start = address.substring(0, prefixLength);
  const end = address.substring(address.length - suffixLength);
  const maskLength = address.length - prefixLength - suffixLength;

  return `${start}${DEFAULT_MASK_CHAR.repeat(Math.min(maskLength, 8))}${end}`;
}

export function maskApiKey(apiKey, visibleLength = 8) {
  if (typeof apiKey !== 'string') {
    return null;
  }

  if (apiKey.length <= visibleLength) {
    return DEFAULT_MASK_CHAR.repeat(apiKey.length);
  }

  const visible = apiKey.substring(0, visibleLength);
  return `${visible}${DEFAULT_MASK_CHAR.repeat(apiKey.length - visibleLength)}`;
}

export function maskToken(token, visibleLength = 6) {
  if (typeof token !== 'string') {
    return null;
  }

  if (token.length <= visibleLength * 2) {
    return DEFAULT_MASK_CHAR.repeat(token.length);
  }

  const start = token.substring(0, visibleLength);
  const end = token.substring(token.length - visibleLength);
  const maskLength = token.length - visibleLength * 2;

  return `${start}${DEFAULT_MASK_CHAR.repeat(maskLength)}${end}`;
}

export function maskObject(object, sensitiveKeys, options = {}) {
  if (!object || typeof object !== 'object') {
    return object;
  }

  const keys = Array.isArray(sensitiveKeys)
    ? sensitiveKeys.map((k) => k.toLowerCase())
    : [];

  const maskValue = options.maskValue || '[REDACTED]';

  const maskRecursively = (value, path = '') => {
    if (value === null || value === undefined) {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((item, index) => maskRecursively(item, `${path}[${index}]`));
    }

    if (typeof value === 'object') {
      const result = {};
      for (const [key, val] of Object.entries(value)) {
        const lowerKey = key.toLowerCase();
        if (keys.includes(lowerKey)) {
          result[key] = maskValue;
        } else {
          result[key] = maskRecursively(val, path ? `${path}.${key}` : key);
        }
      }
      return result;
    }

    return value;
  };

  return maskRecursively(object);
}

export function truncateMiddle(value, maxLength, ellipsis = '...') {
  if (typeof value !== 'string') {
    return null;
  }
  if (value.length <= maxLength) {
    return value;
  }
  if (ellipsis.length >= maxLength) {
    return value.substring(0, maxLength);
  }

  const charsToKeep = maxLength - ellipsis.length;
  const startChars = Math.ceil(charsToKeep / 2);
  const endChars = Math.floor(charsToKeep / 2);

  return `${value.substring(0, startChars)}${ellipsis}${value.substring(value.length - endChars)}`;
}

export function maskAccountNumber(accountNumber, visibleLength = 4) {
  if (typeof accountNumber !== 'string') {
    return null;
  }

  if (accountNumber.length <= visibleLength) {
    return DEFAULT_MASK_CHAR.repeat(accountNumber.length);
  }

  const visible = accountNumber.substring(accountNumber.length - visibleLength);
  return `${DEFAULT_MASK_CHAR.repeat(accountNumber.length - visibleLength)}${visible}`;
}

export const MASK_CONSTRAINTS = Object.freeze({
  defaultMaskChar: DEFAULT_MASK_CHAR,
  defaultVisibleStart: DEFAULT_VISIBLE_START,
  defaultVisibleEnd: DEFAULT_VISIBLE_END,
});