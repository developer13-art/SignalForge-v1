/**
 * Date of Birth Match Service
 *
 * @module signalforge/server/modules/kyc/verification/dob-match
 */

import { VERIFICATION_RESULTS } from '../kyc.constants.js';

function normalizeDate(input) {
  if (!input) {
    return null;
  }
  if (typeof input === 'string') {
    const parsed = new Date(input);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }
    return parsed.toISOString().split('T')[0];
  }
  if (input instanceof Date) {
    return input.toISOString().split('T')[0];
  }
  return null;
}

export class DobMatchService {
  compare(declaredDob, documentDob) {
    const declared = normalizeDate(declaredDob);
    const document = normalizeDate(documentDob);

    if (!declared || !document) {
      return {
        result: VERIFICATION_RESULTS.INCONCLUSIVE,
        matched: false,
        reason: 'Missing date of birth information',
      };
    }

    if (declared === document) {
      return { result: VERIFICATION_RESULTS.PASSED, matched: true };
    }

    return {
      result: VERIFICATION_RESULTS.FAILED,
      matched: false,
      reason: 'Date of birth mismatch',
    };
  }
}

export default DobMatchService;