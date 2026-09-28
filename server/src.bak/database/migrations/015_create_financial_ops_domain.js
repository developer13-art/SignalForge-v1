/**
 * Migration 015 - Financial Operations Domain
 *
 * @module server/database/migrations/015_create_financial_ops_domain
 */

export async function up(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS withdrawal_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      amount NUMERIC(20,8) NOT NULL,
      currency VARCHAR(8) NOT NULL DEFAULT 'USD',
      method VARCHAR(32) NOT NULL,
      source VARCHAR(32) NOT NULL DEFAULT 'WALLET',
      status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
      notes TEXT,
      rejection_reason TEXT,
      processed_by UUID REFERENCES users(id) ON DELETE SET NULL,
      processed_at TIMESTAMPTZ,
      destination_details JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_time
      ON withdrawal_requests (user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status
      ON withdrawal_requests (status);
  `);
}

export async function down(client) {
  await client.query(`DROP TABLE IF EXISTS withdrawal_requests CASCADE`);
}