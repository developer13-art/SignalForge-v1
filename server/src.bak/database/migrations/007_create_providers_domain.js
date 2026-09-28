/**
 * Migration 007 - Providers Domain
 *
 * @module server/database/migrations/007_create_providers_domain
 */

export async function up(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS providers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      display_name VARCHAR(128) NOT NULL,
      description TEXT,
      avatar_url TEXT,
      status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
      certification_status VARCHAR(32) NOT NULL DEFAULT 'NOT_STARTED',
      certified_at TIMESTAMPTZ,
      revenue_share_percent NUMERIC(5,2),
      subscriber_count INTEGER NOT NULL DEFAULT 0,
      metadata JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_providers_status ON providers (status);
    CREATE INDEX IF NOT EXISTS idx_providers_certification
      ON providers (certification_status);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS provider_certifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
      status VARCHAR(32) NOT NULL,
      parsing_accuracy NUMERIC(5,4),
      trade_management_accuracy NUMERIC(5,4),
      consistency_score NUMERIC(5,2),
      risk_score NUMERIC(5,2),
      quality_score NUMERIC(5,2),
      sample_size INTEGER,
      report JSONB,
      certified_by UUID REFERENCES users(id) ON DELETE SET NULL,
      certified_at TIMESTAMPTZ,
      expires_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_provider_certifications_provider
      ON provider_certifications (provider_id, created_at DESC);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS provider_subscriptions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
      plan_code VARCHAR(64),
      price NUMERIC(20,8),
      currency VARCHAR(8) DEFAULT 'USD',
      platform_commission NUMERIC(20,8),
      status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
      started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      cancelled_at TIMESTAMPTZ,
      current_period_start TIMESTAMPTZ,
      current_period_end TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_provider_subscriptions_user
      ON provider_subscriptions (user_id)
      WHERE status = 'ACTIVE';
    CREATE INDEX IF NOT EXISTS idx_provider_subscriptions_provider
      ON provider_subscriptions (provider_id)
      WHERE status = 'ACTIVE';
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS provider_revenue (
      id BIGSERIAL PRIMARY KEY,
      provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
      amount NUMERIC(20,8) NOT NULL,
      currency VARCHAR(8) NOT NULL DEFAULT 'USD',
      reference_type VARCHAR(32),
      reference_id UUID,
      description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_provider_revenue_provider_time
      ON provider_revenue (provider_id, created_at DESC);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS provider_followers (
      id BIGSERIAL PRIMARY KEY,
      provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      followed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (provider_id, user_id)
    );
  `);
}

export async function down(client) {
  await client.query(`DROP TABLE IF EXISTS provider_followers CASCADE`);
  await client.query(`DROP TABLE IF EXISTS provider_revenue CASCADE`);
  await client.query(`DROP TABLE IF EXISTS provider_subscriptions CASCADE`);
  await client.query(`DROP TABLE IF EXISTS provider_certifications CASCADE`);
  await client.query(`DROP TABLE IF EXISTS providers CASCADE`);
}