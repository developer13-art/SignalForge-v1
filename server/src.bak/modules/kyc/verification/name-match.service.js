/**
 * Name Match Service
 *
 * Compares names from a submitted document against the applicant's
 * declared personal information using normalized token comparison.
 *
 * @module signalforge/server/modules/kyc/verification/name-match
 */

import { DEFAULT_NAME_MATCH_THRESHOLD, VERIFICATION_RESULTS } from '../kyc.constants.js';

function normalizeName(name) {
  if (!name || typeof name !== 'string') {
    return '';
  }
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(name) {
  return normalizeName(name).split(' ').filter(Boolean);
}

export class NameMatchService {
  compare(declaredName, documentName, threshold = DEFAULT_NAME_MATCH_THRESHOLD) {
    const declaredTokens = tokenize(declaredName);
    const documentTokens = tokenize(documentName);

    if (declaredTokens.length === 0 || documentTokens.length === 0) {
      return {
        result: VERIFICATION_RESULTS.INCONCLUSIVE,
        score: 0,
        reason: 'Missing name information',
      };
    }

    const declaredSet = new Set(declaredTokens);
    const documentSet = new Set(documentTokens);

    let matchCount = 0;
    for (const token of declaredSet) {
      if (documentSet.has(token)) {
        matchCount++;
      }
    }

    const unionSize = new Set([...declaredSet, ...documentSet]).size;
    const score = unionSize === 0 ? 0 : matchCount / unionSize;

    if (score >= threshold) {
      return { result: VERIFICATION_RESULTS.PASSED, score };
    }

    return {
      result: VERIFICATION_RESULTS.FAILED,
      score,
      reason: 'Name mismatch below threshold',
    };
  }
}

export default NameMatchService;