/**
 * Preferences Validators
 *
 * @module signalforge/server/modules/users/preferences/validator
 */

import { isValidTimezone } from '@signalforge/shared/utils/timezone.util';
import { ALLOWED_LANGUAGES, ALLOWED_THEMES } from '../user.constants.js';

export function validatePreferencesUpdatePayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (body.language !== undefined && !ALLOWED_LANGUAGES.includes(body.language)) {
    errors.push(`Language must be one of: ${ALLOWED_LANGUAGES.join(', ')}`);
  }

  if (body.timezone !== undefined && !isValidTimezone(body.timezone)) {
    errors.push('Timezone is invalid');
  }

  if (body.currency !== undefined) {
    if (typeof body.currency !== 'string' || !/^[A-Z]{3,4}$/.test(body.currency)) {
      errors.push('Currency must be a valid currency code');
    }
  }

  if (body.theme !== undefined && !ALLOWED_THEMES.includes(body.theme)) {
    errors.push(`Theme must be one of: ${ALLOWED_THEMES.join(', ')}`);
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
    if (typeof body.defaultRiskPercent !== 'number' || body.defaultRiskPercent < 0 || body.defaultRiskPercent > 100) {
      errors.push('defaultRiskPercent must be a number between 0 and 100');
    }
  }

  if (body.defaultLotSize !== undefined) {
    if (typeof body.defaultLotSize !== 'number' || body.defaultLotSize < 0) {
      errors.push('defaultLotSize must be a positive number');
    }
  }

  return { valid: errors.length === 0, errors };
}