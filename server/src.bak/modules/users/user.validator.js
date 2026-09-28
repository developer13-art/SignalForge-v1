/**
 * User Validators
 *
 * @module signalforge/server/modules/users/validator
 */

import {
  validateUsername,
  normalizeUsername,
} from '@signalforge/shared/validators/username.validator';
import {
  isValidEmail,
  normalizeEmail,
} from '@signalforge/shared/validators/email.validator';
import {
  isValidPhone,
  normalizePhone,
} from '@signalforge/shared/validators/phone.validator';

import {
  ALLOWED_LANGUAGES,
  ALLOWED_THEMES,
} from './user.constants.js';

export function validateUpdateUserPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (body.firstName !== undefined) {
    if (typeof body.firstName !== 'string') {
      errors.push('First name must be a string');
    } else if (body.firstName.length > 128) {
      errors.push('First name must not exceed 128 characters');
    }
  }

  if (body.middleName !== undefined && body.middleName !== null) {
    if (typeof body.middleName !== 'string') {
      errors.push('Middle name must be a string');
    } else if (body.middleName.length > 128) {
      errors.push('Middle name must not exceed 128 characters');
    }
  }

  if (body.lastName !== undefined) {
    if (typeof body.lastName !== 'string') {
      errors.push('Last name must be a string');
    } else if (body.lastName.length > 128) {
      errors.push('Last name must not exceed 128 characters');
    }
  }

  if (body.username !== undefined && body.username !== null) {
    const username = normalizeUsername(body.username);
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      errors.push(...usernameValidation.errors.map((e) => `username: ${e}`));
    }
  }

  if (body.email !== undefined) {
    const email = normalizeEmail(body.email);
    if (!email || !isValidEmail(email)) {
      errors.push('Email is invalid');
    }
  }

  if (body.phone !== undefined && body.phone !== null) {
    const phone = normalizePhone(body.phone);
    if (!phone || !isValidPhone(phone)) {
      errors.push('Phone number is invalid');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateUpdateProfilePayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (body.dateOfBirth !== undefined && body.dateOfBirth !== null) {
    if (typeof body.dateOfBirth !== 'string') {
      errors.push('Date of birth must be a string');
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(body.dateOfBirth)) {
      errors.push('Date of birth must be in YYYY-MM-DD format');
    }
  }

  if (body.nationality !== undefined && body.nationality !== null) {
    if (typeof body.nationality !== 'string' || body.nationality.length < 2) {
      errors.push('Nationality must be a country code');
    }
  }

  if (body.country !== undefined && body.country !== null) {
    if (typeof body.country !== 'string' || body.country.length < 2) {
      errors.push('Country must be a country code');
    }
  }

  if (body.city !== undefined && body.city !== null) {
    if (typeof body.city !== 'string' || body.city.length > 128) {
      errors.push('City must not exceed 128 characters');
    }
  }

  if (body.address !== undefined && body.address !== null) {
    if (typeof body.address !== 'string' || body.address.length > 512) {
      errors.push('Address must not exceed 512 characters');
    }
  }

  if (body.postalCode !== undefined && body.postalCode !== null) {
    if (typeof body.postalCode !== 'string' || body.postalCode.length > 32) {
      errors.push('Postal code must not exceed 32 characters');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validatePreferencesPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (body.language !== undefined) {
    if (!ALLOWED_LANGUAGES.includes(body.language)) {
      errors.push(`Language must be one of: ${ALLOWED_LANGUAGES.join(', ')}`);
    }
  }

  if (body.timezone !== undefined) {
    if (typeof body.timezone !== 'string') {
      errors.push('Timezone must be a string');
    }
  }

  if (body.currency !== undefined) {
    if (typeof body.currency !== 'string' || !/^[A-Z]{3,4}$/.test(body.currency)) {
      errors.push('Currency must be a valid currency code');
    }
  }

  if (body.theme !== undefined) {
    if (!ALLOWED_THEMES.includes(body.theme)) {
      errors.push(`Theme must be one of: ${ALLOWED_THEMES.join(', ')}`);
    }
  }

  const booleanFields = [
    'emailNotifications',
    'pushNotifications',
    'smsNotifications',
    'marketingEmails',
    'securityAlerts',
    'autoTradingEnabled',
  ];

  for (const field of booleanFields) {
    if (body[field] !== undefined && typeof body[field] !== 'boolean') {
      errors.push(`${field} must be a boolean`);
    }
  }

  if (body.defaultRiskPercent !== undefined) {
    if (typeof body.defaultRiskPercent !== 'number') {
      errors.push('defaultRiskPercent must be a number');
    } else if (body.defaultRiskPercent < 0 || body.defaultRiskPercent > 100) {
      errors.push('defaultRiskPercent must be between 0 and 100');
    }
  }

  if (body.defaultLotSize !== undefined) {
    if (typeof body.defaultLotSize !== 'number') {
      errors.push('defaultLotSize must be a number');
    } else if (body.defaultLotSize < 0) {
      errors.push('defaultLotSize must be a positive number');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateAvatarPayload(file) {
  const errors = [];

  if (!file) {
    return { valid: false, errors: ['Avatar file is required'] };
  }

  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    errors.push(`Avatar must be one of: ${allowedMimeTypes.join(', ')}`);
  }

  const maxSize = 5 * 1024 * 1024;
  if (file.size && file.size > maxSize) {
    errors.push(`Avatar must not exceed ${maxSize / 1024 / 1024} MB`);
  }

  return { valid: errors.length === 0, errors };
}