/**
 * Provider Journey E2E Test
 *
 * @module server/tests/e2e/provider-journey.e2e.test
 */

import { describe, test, expect } from '@jest/globals';
import { buildStandardizedSignal } from '@signalforge/shared/schemas/standardized-signal.schema';

describe('E2E: Provider journey', () => {
  test('message → parsed signal → normalized schema', () => {
    const signal = buildStandardizedSignal({
      signalId: '11111111-1111-4111-8111-111111111111',
      providerId: '22222222-2222-4222-8222-222222222222',
      sourceType: 'TELEGRAM',
      sourceId: 'channel-1',
      rawMessageId: 'msg-1',
      symbol: 'XAUUSD',
      direction: 'BUY',
      entryType: 'MARKET',
      confidence: 0.95,
      classification: 'NEW_TRADE',
      timestamp: new Date().toISOString(),
    });

    expect(signal.symbol).toBe('XAUUSD');
    expect(signal.direction).toBe('BUY');
    expect(signal.entryType).toBe('MARKET');
    expect(signal.confidence).toBe(0.95);
  });
});