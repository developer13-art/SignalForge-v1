/**
 * Factory Test Helper
 *
 * @module server/tests/helpers/factory.helper
 */

import { db } from '../../src/database';

function randomEmail(prefix = 'user') {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}@signalforge.local`;
}

export async function createUserRecord({ overrides = {} } = {}) {
  const values = {
    email: overrides.email || randomEmail('user'),
    password_hash: overrides.password_hash || '$2a$12$mock',
    first_name: overrides.first_name || 'Test',
    last_name: overrides.last_name || 'User',
    status: overrides.status || 'ACTIVE',
    kyc_status: overrides.kyc_status || 'VERIFIED',
  };

  const { rows } = await db.query(
    `INSERT INTO users (email, password_hash, first_name, last_name, status, kyc_status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
     RETURNING *`,
    [values.email, values.password_hash, values.first_name, values.last_name, values.status, values.kyc_status],
  );

  return rows[0];
}

export async function createBrokerAccountRecord({ userId, overrides = {} } = {}) {
  if (!userId) {
    throw new Error('userId is required');
  }

  const { rows } = await db.query(
    `INSERT INTO broker_accounts
       (user_id, platform, server, account_number_encrypted, account_password_encrypted, account_type, connection_status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
     RETURNING *`,
    [
      userId,
      overrides.platform || 'MT5',
      overrides.server || 'TestServer',
      overrides.account_number_encrypted || 'enc',
      overrides.account_password_encrypted || 'enc',
      overrides.account_type || 'DEMO',
      overrides.connection_status || 'CONNECTED',
    ],
  );

  return rows[0];
}

export async function createSignalRecord({ overrides = {} } = {}) {
  const { rows } = await db.query(
    `INSERT INTO signals
       (symbol, direction, entry_type, status, classification, confidence, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
     RETURNING *`,
    [
      overrides.symbol || 'EURUSD',
      overrides.direction || 'BUY',
      overrides.entry_type || 'MARKET',
      overrides.status || 'RECEIVED',
      overrides.classification || 'NEW_TRADE',
      overrides.confidence ?? 0.9,
    ],
  );

  return rows[0];
}

export async function createTradeRecord({ userId, brokerAccountId, overrides = {} } = {}) {
  if (!userId || !brokerAccountId) {
    throw new Error('userId and brokerAccountId are required');
  }

  const { rows } = await db.query(
    `INSERT INTO trades
       (user_id, broker_account_id, symbol, direction, volume, entry_price, status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
     RETURNING *`,
    [
      userId,
      brokerAccountId,
      overrides.symbol || 'EURUSD',
      overrides.direction || 'BUY',
      overrides.volume ?? 0.1,
      overrides.entry_price ?? 1.1,
      overrides.status || 'OPEN',
    ],
  );

  return rows[0];
}

export const factoryHelper = {
  createUserRecord,
  createBrokerAccountRecord,
  createSignalRecord,
  createTradeRecord,
};