/**
 * Migration 013 - Affiliate / IB Domain
 *
 * @module server/database/migrations/013_create_affiliate_ib_domain
 */

export async function up(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS affiliate_partners (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
      tier VARCHAR(32) NOT NULL DEFAULT 'STANDARD',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS affiliate_links (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      code VARCHAR(32) NOT NULL UNIQUE,
      label VARCHAR(128),
      destination VARCHAR(512),
      active BOOLEAN NOT NULL DEFAULT TRUE,
      clicks INTEGER NOT NULL DEFAULT 0,
      conversions INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_affiliate_links_user
      ON affiliate_links (user_id);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS affiliate_referrals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      partner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      referred_user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      affiliate_link_id UUID REFERENCES affiliate_links(id) ON DELETE SET NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
      source VARCHAR(64),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_partner
      ON affiliate_referrals (partner_user_id);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS affiliate_commissions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      partner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      referral_id UUID REFERENCES affiliate_referrals(id) ON DELETE SET NULL,
      amount NUMERIC(20,8) NOT NULL,
      currency VARCHAR(8) NOT NULL DEFAULT 'USD',
      status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
      description TEXT,
      rejection_reason TEXT,
      approved_at TIMESTAMPTZ,
      paid_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_partner_status
      ON affiliate_commissions (partner_user_id, status);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS ib_partners (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
      tier VARCHAR(32) NOT NULL DEFAULT 'STANDARD',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS ib_links (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      broker_id UUID REFERENCES brokers(id) ON DELETE SET NULL,
      code VARCHAR(32) NOT NULL UNIQUE,
      label VARCHAR(128),
      destination VARCHAR(512),
      active BOOLEAN NOT NULL DEFAULT TRUE,
      clicks INTEGER NOT NULL DEFAULT 0,
      conversions INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_ib_links_user ON ib_links (user_id);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS ib_referrals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      partner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      referred_user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      broker_account_id UUID REFERENCES broker_accounts(id) ON DELETE SET NULL,
      ib_link_id UUID REFERENCES ib_links(id) ON DELETE SET NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
      source VARCHAR(64),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_ib_referrals_partner
      ON ib_referrals (partner_user_id);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS ib_revenue_entries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      partner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      referral_id UUID REFERENCES ib_referrals(id) ON DELETE SET NULL,
      amount NUMERIC(20,8) NOT NULL,
      currency VARCHAR(8) NOT NULL DEFAULT 'USD',
      status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
      description TEXT,
      rejection_reason TEXT,
      approved_at TIMESTAMPTZ,
      paid_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_ib_revenue_partner_status
      ON ib_revenue_entries (partner_user_id, status);
  `);
}

export async function down(client) {
  await client.query(`DROP TABLE IF EXISTS ib_revenue_entries CASCADE`);
  await client.query(`DROP TABLE IF EXISTS ib_referrals CASCADE`);
  await client.query(`DROP TABLE IF EXISTS ib_links CASCADE`);
  await client.query(`DROP TABLE IF EXISTS ib_partners CASCADE`);
  await client.query(`DROP TABLE IF EXISTS affiliate_commissions CASCADE`);
  await client.query(`DROP TABLE IF EXISTS affiliate_referrals CASCADE`);
  await client.query(`DROP TABLE IF EXISTS affiliate_links CASCADE`);
  await client.query(`DROP TABLE IF EXISTS affiliate_partners CASCADE`);
}