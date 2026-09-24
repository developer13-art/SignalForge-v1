/**
 * Provider DNA Unit Tests
 *
 * @module server/tests/unit/provider-dna.test
 */

import { describe, test, expect } from '@jest/globals';
import { matchesDnaRule } from '@signalforge/shared/schemas/provider-dna-rule.schema';

describe('Provider DNA rule matching', () => {
  test('CONTAINS matches correctly', () => {
    const rule = { matchType: 'CONTAINS', pattern: 'secure profit', caseSensitive: false };
    expect(matchesDnaRule(rule, 'Please Secure Profit on this trade')).toBe(true);
    expect(matchesDnaRule(rule, 'Close all positions')).toBe(false);
  });

  test('EXACT matches correctly', () => {
    const rule = { matchType: 'EXACT', pattern: 'close some', caseSensitive: false };
    expect(matchesDnaRule(rule, 'close some')).toBe(true);
    expect(matchesDnaRule(rule, 'close some now')).toBe(false);
  });
});