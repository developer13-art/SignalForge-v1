/**
 * Phone Validator
 *
 * Provides validation for phone numbers used across the SignalForge
 * platform. Uses E.164 international format as the canonical form and
 * supports country-specific validation for a configurable set of
 * countries.
 *
 * @module @signalforge/shared/validators/phone
 */

const E164_REGEX = /^\+[1-9]\d{1,14}$/;

const COUNTRY_RULES = Object.freeze({
  NG: { code: '234', nationalLength: [10], prefix: '+' },
  US: { code: '1', nationalLength: [10], prefix: '+' },
  GB: { code: '44', nationalLength: [10], prefix: '+' },
  CA: { code: '1', nationalLength: [10], prefix: '+' },
  GH: { code: '233', nationalLength: [9], prefix: '+' },
  ZA: { code: '27', nationalLength: [9], prefix: '+' },
  KE: { code: '254', nationalLength: [9], prefix: '+' },
  IN: { code: '91', nationalLength: [10], prefix: '+' },
  DE: { code: '49', nationalLength: [10, 11], prefix: '+' },
  FR: { code: '33', nationalLength: [9], prefix: '+' },
  ES: { code: '34', nationalLength: [9], prefix: '+' },
  IT: { code: '39', nationalLength: [9, 10], prefix: '+' },
  BR: { code: '55', nationalLength: [10, 11], prefix: '+' },
  AU: { code: '61', nationalLength: [9], prefix: '+' },
  JP: { code: '81', nationalLength: [10], prefix: '+' },
  CN: { code: '86', nationalLength: [11], prefix: '+' },
  AE: { code: '971', nationalLength: [9], prefix: '+' },
  SA: { code: '966', nationalLength: [9], prefix: '+' },
  EG: { code: '20', nationalLength: [10], prefix: '+' },
});

export function isValidE164(phone) {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  return E164_REGEX.test(phone.trim());
}

export function stripPhoneFormatting(phone) {
  if (!phone || typeof phone !== 'string') {
    return null;
  }
  return phone.replace(/[\s\-().]/g, '');
}

export function normalizePhone(phone, defaultCountry = null) {
  if (!phone || typeof phone !== 'string') {
    return null;
  }

  const stripped = stripPhoneFormatting(phone);

  if (stripped.startsWith('+')) {
    return E164_REGEX.test(stripped) ? stripped : null;
  }

  if (stripped.startsWith('00')) {
    const internationalized = `+${stripped.substring(2)}`;
    return E164_REGEX.test(internationalized) ? internationalized : null;
  }

  if (defaultCountry && COUNTRY_RULES[defaultCountry]) {
    const rule = COUNTRY_RULES[defaultCountry];
    const withoutLeadingZero = stripped.replace(/^0+/, '');
    const candidate = `+${rule.code}${withoutLeadingZero}`;
    return E164_REGEX.test(candidate) ? candidate : null;
  }

  return null;
}

export function isValidPhone(phone, defaultCountry = null) {
  const normalized = normalizePhone(phone, defaultCountry);
  return normalized !== null;
}

export function validatePhoneForCountry(phone, countryCode) {
  const errors = [];

  if (!phone || typeof phone !== 'string') {
    return { valid: false, errors: ['Phone number is required'] };
  }

  const rule = COUNTRY_RULES[countryCode];
  if (!rule) {
    return { valid: false, errors: [`Unsupported country code: ${countryCode}`] };
  }

  const stripped = stripPhoneFormatting(phone);
  let nationalPart;

  if (stripped.startsWith('+')) {
    const withoutPlus = stripped.substring(1);
    if (!withoutPlus.startsWith(rule.code)) {
      return {
        valid: false,
        errors: [`Phone number does not match country code ${rule.code}`],
      };
    }
    nationalPart = withoutPlus.substring(rule.code.length);
  } else {
    nationalPart = stripped.replace(/^0+/, '');
  }

  if (!rule.nationalLength.includes(nationalPart.length)) {
    errors.push(
      `Phone number must have national length of ${rule.nationalLength.join(' or ')} digits for ${countryCode}`,
    );
  }

  if (!/^\d+$/.test(nationalPart)) {
    errors.push('Phone number must contain only digits');
  }

  return { valid: errors.length === 0, errors };
}

export function getCountryFromPhone(phone) {
  if (!isValidE164(phone)) {
    return null;
  }

  const digitsOnly = phone.substring(1);
  const sortedCountries = Object.entries(COUNTRY_RULES).sort(
    (a, b) => b[1].code.length - a[1].code.length,
  );

  for (const [country, rule] of sortedCountries) {
    if (digitsOnly.startsWith(rule.code)) {
      return country;
    }
  }

  return null;
}

export function maskPhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return null;
  }
  const stripped = stripPhoneFormatting(phone);
  if (stripped.length < 6) {
    return '****';
  }
  const firstChars = stripped.substring(0, stripped.length - 4);
  const lastChars = stripped.substring(stripped.length - 4);
  return `${firstChars}****`;
}

export const PHONE_CONSTRAINTS = Object.freeze({
  minLength: 8,
  maxLength: 15,
  supportedCountries: Object.keys(COUNTRY_RULES),
});