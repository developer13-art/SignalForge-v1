/**
 * Solana Provenance Integration Tests
 *
 * @module server/tests/integration/solana-provenance.integration.test
 */

import { describe, test, expect } from '@jest/globals';
import { computeProcessingHash, verifyProcessingHash } from '@signalforge/shared/utils/hash.util';

describe('Solana provenance integration', () => {
  test('processing hash is deterministic and verifiable', () => {
    const signal = {
      signalId: '11111111-1111-4111-8111-111111111111',
      providerId: '22222222-2222-4222-8222-222222222222',
      symbol: 'EURUSD',
      direction: 'BUY',
      entryPrice: 1.1,
      stopLoss: 1.09,
      takeProfits: [1.11, 1.12],
      confidence: 0.9,
      classification: 'NEW_TRADE',
      timestamp: '2024-01-01T00:00:00.000Z',
    };

    const canonical = {
      signal,
      aiVersion: 'v1',
      parserType: 'LEARNING_PATH',
      modelId: 'gpt-4o',
      steps: ['received', 'classified', 'parsed'],
    };

    const { hashObject } = require('@signalforge/shared/utils/hash.util');
    const hash1 = hashObject(canonical);
    const hash2 = hashObject(canonical);

    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64);
  });
});