/**
 * Expiry Check
 *
 * @module signalforge/server/modules/validation/validators/expiry
 */

import {
  VALIDATION_RESULTS,
  VALIDATION_CHECK_NAMES,
  DEFAULT_MAX_SIGNAL_AGE_MINUTES,
} from '../validation.constants.js';

export class ExpiryCheck {
  constructor() {
    this.name = VALIDATION_CHECK_NAMES.EXPIRY;
  }

  async run(signal, context = {}) {
    const maxAgeMinutes = context.maxSignalAgeMinutes || DEFAULT_MAX_SIGNAL_AGE_MINUTES;
    const referenceTime = context.referenceTime || Date.now();

    if (signal.expiresAt) {
      const expiresAt = new Date(signal.expiresAt).getTime();
      if (Number.isNaN(expiresAt)) {
        return {
          name: this.name,
          result: VALIDATION_RESULTS.FAILED,
          reason: 'Expiry timestamp is invalid',
        };
      }
      if (expiresAt < referenceTime) {
        return {
          name: this.name,
          result: VALIDATION_RESULTS.FAILED,
          reason: 'Signal has expired',
        };
      }
      return { name: this.name, result: VALIDATION_RESULTS.PASSED };
    }

    if (!signal.timestamp) {
      return {
        name: this.name,
        result: VALIDATION_RESULTS.WARNING,
        reason: 'Signal timestamp is missing',
      };
    }

    const signalTime = new Date(signal.timestamp).getTime();
    if (Number.isNaN(signalTime)) {
      return {
        name: this.name,
        result: VALIDATION_RESULTS.WARNING,
        reason: 'Signal timestamp is invalid',
      };
    }

    const ageMinutes = (referenceTime - signalTime) / (60 * 1000);
    if (ageMinutes > maxAgeMinutes) {
      return {
        name: this.name,
        result: VALIDATION_RESULTS.FAILED,
        reason: `Signal is older than ${maxAgeMinutes} minutes`,
      };
    }

    return { name: this.name, result: VALIDATION_RESULTS.PASSED };
  }
}

export default ExpiryCheck;