/**
 * Classification Unit Tests
 *
 * @module server/tests/unit/classification.test
 */

import { describe, test, expect } from '@jest/globals';
import { SIGNAL_CLASSIFICATIONS } from '@signalforge/shared/constants/signal-classifications';

describe('Classification constants', () => {
  test('NEW_TRADE and TRADE_MANAGEMENT classifications exist', () => {
    expect(SIGNAL_CLASSIFICATIONS.NEW_TRADE).toBe('NEW_TRADE');
    expect(SIGNAL_CLASSIFICATIONS.TRADE_MANAGEMENT).toBe('TRADE_MANAGEMENT');
  });

  test('all classifications are strings', () => {
    for (const value of Object.values(SIGNAL_CLASSIFICATIONS)) {
      expect(typeof value).toBe('string');
    }
  });
});