/**
 * Source Trust Check
 *
 * @module signalforge/server/modules/validation/validators/source-trust
 */

import {
  VALIDATION_RESULTS,
  VALIDATION_CHECK_NAMES,
  DEFAULT_MIN_SOURCE_TRUST,
} from '../validation.constants.js';

export class SourceTrustCheck {
  constructor() {
    this.name = VALIDATION_CHECK_NAMES.SOURCE_TRUST;
  }

  async run(signal, context = {}) {
    const minTrust = context.minSourceTrust ?? DEFAULT_MIN_SOURCE_TRUST;
    const trust = context.sourceTrust;

    if (trust === undefined || trust === null) {
      if (context.allowUnknownTrust) {
        return { name: this.name, result: VALIDATION_RESULTS.PASSED };
      }
      return {
        name: this.name,
        result: VALIDATION_RESULTS.WARNING,
        reason: 'Source trust is unknown',
      };
    }

    if (trust < minTrust) {
      return {
        name: this.name,
        result: VALIDATION_RESULTS.FAILED,
        reason: `Source trust ${trust} is below minimum ${minTrust}`,
      };
    }

    return { name: this.name, result: VALIDATION_RESULTS.PASSED };
  }
}

export default SourceTrustCheck;