/**
 * Mock Test Helper
 *
 * @module server/tests/helpers/mock.helper
 */

import { jest } from '@jest/globals';

export function mockLogger() {
  return {
    trace: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
    child: jest.fn().mockReturnThis(),
  };
}

export function mockEventBus() {
  return {
    publish: jest.fn().mockResolvedValue({ eventId: 'mock-event-id' }),
    on: jest.fn(),
    off: jest.fn(),
  };
}

export function mockMetaApiClient(overrides = {}) {
  return {
    connectAccount: jest.fn().mockResolvedValue({ id: 'mock-metaapi-id' }),
    getAccountInformation: jest.fn().mockResolvedValue({ balance: 1000, equity: 1000 }),
    createMarketOrder: jest.fn().mockResolvedValue({ orderId: 'mock-order-id', positionId: 'mock-position-id' }),
    closePosition: jest.fn().mockResolvedValue({ success: true }),
    modifyPosition: jest.fn().mockResolvedValue({ success: true }),
    ...overrides,
  };
}

export function mockSolanaConnection() {
  return {
    getSlot: jest.fn().mockResolvedValue(1),
    getLatestBlockhash: jest.fn().mockResolvedValue({ blockhash: 'mock-blockhash', lastValidBlockHeight: 1000 }),
    getBalance: jest.fn().mockResolvedValue(1000000000),
    getTransaction: jest.fn().mockResolvedValue(null),
    sendRawTransaction: jest.fn().mockResolvedValue('mock-signature'),
  };
}

export function mockHttpRequestResponse() {
  const req = {
    user: null,
    headers: {},
    query: {},
    params: {},
    body: {},
  };

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
  };

  const next = jest.fn();

  return { req, res, next };
}

export const mockHelper = {
  mockLogger,
  mockEventBus,
  mockMetaApiClient,
  mockSolanaConnection,
  mockHttpRequestResponse,
};