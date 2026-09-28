/**
 * Completeness Check
 *
 * @module signalforge/server/modules/validation/validators/completeness
 */

import { VALIDATION_RESULTS, VALIDATION_CHECK_NAMES } from '../validation.constants.js';

const REQUIRED_FIELDS = [
  'signalId',
  'providerId',
  'sourceId',
  'rawMessageId',
  'symbol',
  'direction',
  'entryType',
  'classification',
  'confidence',
  'timestamp',
];

export class CompletenessCheck {
  constructor() {
    this.name = VALIDATION_CHECK_NAMES.COMPLETENESS;
  }

  async run(signal) {
    const missing = [];
    for (const field of REQUIRED_FIELDS) {
      if (signal[field] === undefined || signal[field] === null) {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      return {
        name: this.name,
        result: VALIDATION_RESULTS.FAILED,
        reason: `Missing required fields: ${missing.join(', ')}`,
        details: { missing },
      };
    }

    if (typeof signal.confidence !== 'number') {
      return {
        name: this.name,
        result: VALIDATION_RESULTS.FAILED,
        reason: 'Confidence must be a number',
      };
    }

    if (signal.confidence < 0 || signal.confidence > 1) {
      return {
        name: this.name,
        result: VALIDATION_RESULTS.FAILED,
        reason: 'Confidence must be between 0 and 1',
      };
    }

    return { name: this.name, result: VALIDATION_RESULTS.PASSED };
  }
}

export default CompletenessCheck;