/**
 * Test Setup
 *
 * Global test setup. Loads environment, initializes a test database
 * connection, and configures Jest timeouts.
 *
 * @module server/tests/setup
 */

import { jest } from '@jest/globals';

process.env.NODE_ENV = 'test';

jest.setTimeout(30000);

let db = null;

beforeAll(async () => {
  try {
    const dbModule = await import('../src/database');
    db = dbModule.db;
  } catch (err) {
    // Database not available; tests that need it will skip
  }
});

afterAll(async () => {
  try {
    const connectionModule = await import('../src/database/connection');
    if (connectionModule.closePool) {
      await connectionModule.closePool();
    }
  } catch (err) {
    // ignore
  }
});

export function getTestDb() {
  return db;
}