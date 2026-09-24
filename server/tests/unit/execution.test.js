/**
 * Execution Unit Tests
 *
 * @module server/tests/unit/execution.test
 */

import { describe, test, expect } from '@jest/globals';
import { buildExecutionRequest } from '@signalforge/shared/schemas/execution-request.schema';

describe('Execution request builder', () => {
  test('builds valid execution request', () => {
    const request = buildExecutionRequest({
      executionRequestId: 'req-1',
      tradeId: 't-1',
      userId: 'u-1',
      brokerAccountId: 'ba-1',
      symbol: 'EURUSD',
      direction: 'BUY',
      entryType: 'MARKET',
      volume: 0.1,
    });

    expect(request.executionRequestId).toBe('req-1');
    expect(request.volume).toBe(0.1);
    expect(request.attempt).toBe(1);
    expect(request.maxAttempts).toBe(3);
  });
});