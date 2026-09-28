/**
 * Migration 010 - Referral Domain
 *
 * @module server/database/migrations/010_create_referral_domain
 */

export async function up(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS referral_codes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      code VARCHAR(32) NOT NULL UNIQUE,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS referral_relationships (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      referred_user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      referral_code_id UUID REFERENCES referral_codes(id) ON DELETE SET NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_referral_relationships_referrer
      ON referral_relationships (referrer_id);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS referral_rewards (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      referred_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      settlement_period VARCHAR(7) NOT NULL,
      currency VARCHAR(8) NOT NULL DEFAULT 'USD',
      gross_profit NUMERIC(20,8),
      gross_loss NUMERIC(20,8),
      eligible_costs NUMERIC(20,8),
      eligible_net_profit NUMERIC(20,8) NOT NULL DEFAULT 0,
      reward_rate NUMERIC(8,6) NOT NULL,
      reward_amount NUMERIC(20,8) NOT NULL DEFAULT 0,
      status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
      fraud_score NUMERIC(5,4),
      fraud_flags JSONB,
      reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
      approved_at TIMESTAMPTZ,
      settled_at TIMESTAMPTZ,
      rejected_at TIMESTAMPTZ,
      rejection_reason TEXT,
      ledger_entry_id UUID,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_referral_rewards_referrer_period
      ON referral_rewards (referrer_id, settlement_period DESC);
    CREATE INDEX IF NOT EXISTS idx_referral_rewards_status
      ON referral_rewards (status);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS referral_settlements (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      period VARCHAR(7) NOT NULL UNIQUE,
      status VARCHAR(32) NOT NULL DEFAULT 'SCHEDULED',
      total_rewards INTEGER DEFAULT 0,
      total_reward_amount NUMERIC(20,8) DEFAULT 0,
      started_at TIMESTAMPTZ,
      completed_at TIMESTAMPTZ,
      failure_reason TEXT,
      metadata JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS referral_wallets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      currency VARCHAR(8) NOT NULL DEFAULT 'USD',
      pending_balance NUMERIC(20,8) NOT NULL DEFAULT 0,
      available_balance NUMERIC(20,8) NOT NULL DEFAULT 0,
      lifetime_earned NUMERIC(20,8) NOT NULL DEFAULT 0,
      lifetime_withdrawn NUMERIC(20,8) NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS referral_ledger (
      id BIGSERIAL PRIMARY KEY,
      wallet_id UUID NOT NULL REFERENCES referral_wallets(id) ON DELETE CASCADE,
      entry_type VARCHAR(64) NOT NULL,
      amount NUMERIC(20,8) NOT NULL,
      currency VARCHAR(8) NOT NULL DEFAULT 'USD',
      balance_before NUMERIC(20,8),
      balance_after NUMERIC(20,8),
      reference_type VARCHAR(64),
      reference_id UUID,
      description TEXT,
      related_entry_id UUID,
      is_reversal BOOLEAN NOT NULL DEFAULT FALSE,
      reversal_of_entry_id UUID,
      actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
      actor_type VARCHAR(32),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_referral_ledger_wallet_time
      ON referral_ledger (wallet_id, created_at DESC);
  `);
}

export async function down(client) {
  await client.query(`DROP TABLE IF EXISTS referral_ledger CASCADE`);
  await client.query(`DROP TABLE IF EXISTS referral_wallets CASCADE`);
  await client.query(`DROP TABLE IF EXISTS referral_settlements CASCADE`);
  await client.query(`DROP TABLE IF EXISTS referral_rewards CASCADE`);
  await client.query(`DROP TABLE IF EXISTS referral_relationships CASCADE`);
  await client.query(`DROP TABLE IF EXISTS referral_codes CASCADE`);
}