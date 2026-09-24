/**
 * Execution Integration Tests
 *
 * @module server/tests/integration/execution.integration.test
 */

import { describe, test, expect } from '@jest/globals';
import { buildExecutionRequest, validateExecutionRequest } from '@signalforge/shared/schemas/execution-request.schema';

describe('Execution integration', () => {
  test('builds and validates execution request', () => {
    const request = buildExecutionRequest({
      executionRequestId: '11111111-1111-4111-8111-111111111111',
      tradeId: '22222222-2222-4222-8222-222222222222',
      userId: '33333333-3333-4333-8333-333333333333',
      brokerAccountId: '44444444-4444-4444-8444-444444444444',
      symbol: 'EURUSD',
      direction: 'BUY',
      entryType: 'MARKET',
      volume: 0.1,
    });

    const validation = validateExecutionRequest(request);
    expect(validation.valid).toBe(true);
  });

  test('market order with price null passes validation', () => {
    const request = buildExecutionRequest({
      executionRequestId: '11111111-1111-4111-8111-111111111111',
      tradeId: '22222222-2222-4222-8222-222222222222',
      userId: '33333333-3333-4333-8333-333333333333',
      brokerAccountId: '44444444-4444-4444-8444-444444444444',
      symbol: 'EURUSD',
      direction: 'BUY',
      entryType: 'MARKET',
      volume: 0.1,
    });

    expect(request.price).toBeNull();
  });
});