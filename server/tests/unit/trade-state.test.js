/**
 * Trade State Unit Tests
 *
 * @module server/tests/unit/trade-state.test
 */

import { describe, test, expect } from '@jest/globals';
import { isValidTransition, TRADE_STATES } from '@signalforge/shared/constants/trade-states';

describe('Trade state transitions', () => {
  test('valid transition from SIGNAL_RECEIVED to PARSED', () => {
    expect(isValidTransition(TRADE_STATES.SIGNAL_RECEIVED, TRADE_STATES.PARSED)).toBe(true);
  });

  test('invalid transition from CLOSED to OPEN', () => {
    expect(isValidTransition(TRADE_STATES.CLOSED, TRADE_STATES.OPEN)).toBe(false);
  });

  test('valid transition from OPEN to CLOSED', () => {
    expect(isValidTransition(TRADE_STATES.OPEN, TRADE_STATES.CLOSED)).toBe(true);
  });
});