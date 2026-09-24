/**
 * Migration 004 - Brokers Domain
 *
 * @module server/database/migrations/004_create_brokers_domain
 */

export async function up(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS brokers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(128) NOT NULL UNIQUE,
      platform VARCHAR(16) NOT NULL,
      server VARCHAR(128),
      logo_url TEXT,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      metadata JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS broker_accounts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      broker_id UUID REFERENCES brokers(id) ON DELETE SET NULL,
      account_nickname VARCHAR(128),
      platform VARCHAR(16) NOT NULL,
      server VARCHAR(128),
      account_number_encrypted TEXT,
      account_password_encrypted TEXT,
      metaapi_account_id VARCHAR(128),
      account_type VARCHAR(16) NOT NULL DEFAULT 'DEMO',
      currency VARCHAR(8),
      leverage INTEGER,
      balance NUMERIC(20,8) DEFAULT 0,
      equity NUMERIC(20,8) DEFAULT 0,
      margin NUMERIC(20,8) DEFAULT 0,
      free_margin NUMERIC(20,8) DEFAULT 0,
      connection_status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
      disconnected_reason TEXT,
      disconnected_by UUID REFERENCES users(id) ON DELETE SET NULL,
      last_synced_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_broker_accounts_user ON broker_accounts (user_id);
    CREATE INDEX IF NOT EXISTS idx_broker_accounts_status ON broker_accounts (connection_status);
    CREATE INDEX IF NOT EXISTS idx_broker_accounts_metaapi ON broker_accounts (metaapi_account_id);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS account_snapshots (
      id BIGSERIAL PRIMARY KEY,
      broker_account_id UUID NOT NULL REFERENCES broker_accounts(id) ON DELETE CASCADE,
      balance NUMERIC(20,8),
      equity NUMERIC(20,8),
      margin NUMERIC(20,8),
      free_margin NUMERIC(20,8),
      captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_account_snapshots_account_time
      ON account_snapshots (broker_account_id, captured_at DESC);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS connection_logs (
      id BIGSERIAL PRIMARY KEY,
      broker_account_id UUID NOT NULL REFERENCES broker_accounts(id) ON DELETE CASCADE,
      event_type VARCHAR(64) NOT NULL,
      message TEXT,
      metadata JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_connection_logs_account_time
      ON connection_logs (broker_account_id, created_at DESC);
  `);
}

export async function down(client) {
  await client.query(`DROP TABLE IF EXISTS connection_logs CASCADE`);
  await client.query(`DROP TABLE IF EXISTS account_snapshots CASCADE`);
  await client.query(`DROP TABLE IF EXISTS broker_accounts CASCADE`);
  await client.query(`DROP TABLE IF EXISTS brokers CASCADE`);
}