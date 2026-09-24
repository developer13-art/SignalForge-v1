/**
 * Parser Unit Tests
 *
 * @module server/tests/unit/parser.test
 */

import { describe, test, expect } from '@jest/globals';
import { validateStandardizedSignal } from '@signalforge/shared/schemas/standardized-signal.schema';

describe('Standardized signal validation', () => {
  test('valid signal passes validation', () => {
    const signal = {
      signalId: '11111111-1111-4111-8111-111111111111',
      providerId: '22222222-2222-4222-8222-222222222222',
      sourceType: 'TELEGRAM',
      sourceId: 'src-1',
      rawMessageId: 'msg-1',
      symbol: 'EURUSD',
      direction: 'BUY',
      entryType: 'MARKET',
      confidence: 0.9,
      classification: 'NEW_TRADE',
      timestamp: new Date().toISOString(),
    };

    const result = validateStandardizedSignal(signal);
    expect(result.valid).toBe(true);
  });

  test('signal missing required fields fails validation', () => {
    const signal = { symbol: 'EURUSD' };
    const result = validateStandardizedSignal(signal);
    expect(result.valid).toBe(false);
  });
}); 