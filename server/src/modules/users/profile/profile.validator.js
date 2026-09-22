/**
 * Profile Validators
 *
 * @module signalforge/server/modules/users/profile/validator
 */

import { isValidTimezone } from '@signalforge/shared/utils/timezone.util';
import { ALLOWED_LANGUAGES } from '../user.constants.js';

export function validateProfilePayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (body.dateOfBirth !== undefined && body.dateOfBirth !== null) {
    if (typeof body.dateOfBirth !== 'string') {
      errors.push('Date of birth must be a string');
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(body.dateOfBirth)) {
      errors.push('Date of birth must be in YYYY-MM-DD format');
    } else {
      const age = (Date.now() - new Date(body.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      if (age < 18) {
        errors.push('You must be at least 18 years old');
      }
      if (age > 120) {
        errors.push('Date of birth is not valid');
      }
    }
  }

  if (body.nationality !== undefined && body.nationality !== null) {
    if (typeof body.nationality !== 'string' || body.nationality.length > 3) {
      errors.push('Nationality must be a valid country code');
    }
  }

  if (body.country !== undefined && body.country !== null) {
    if (typeof body.country !== 'string' || body.country.length > 3) {
      errors.push('Country must be a valid country code');
    }
  }

  if (body.timezone !== undefined && body.timezone !== null) {
    if (!isValidTimezone(body.timezone)) {
      errors.push('Timezone is invalid');
    }
  }

  if (body.language !== undefined && body.language !== null) {
    if (!ALLOWED_LANGUAGES.includes(body.language)) {
      errors.push(`Language must be one of: ${ALLOWED_LANGUAGES.join(', ')}`);
    }
  }

  if (body.bio !== undefined && body.bio !== null) {
    if (typeof body.bio !== 'string' || body.bio.length > 1000) {
      errors.push('Bio must not exceed 1000 characters');
    }
  }

  if (body.tradingExperience !== undefined && body.tradingExperience !== null) {
    const allowed = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PROFESSIONAL'];
    if (!allowed.includes(body.tradingExperience)) {
      errors.push(`Trading experience must be one of: ${allowed.join(', ')}`);
    }
  }

  return { valid: errors.length === 0, errors };
}