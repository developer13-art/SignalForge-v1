/**
 * Migration 012 - Marketplace Domain
 *
 * @module server/database/migrations/012_create_marketplace_domain
 */

export async function up(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS marketplace_listings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      summary TEXT,
      description TEXT,
      category VARCHAR(64),
      tags JSONB,
      price NUMERIC(20,8),
      currency VARCHAR(8) NOT NULL DEFAULT 'USD',
      status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
      review_count INTEGER NOT NULL DEFAULT 0,
      rating_average NUMERIC(3,2),
      subscriber_count INTEGER NOT NULL DEFAULT 0,
      metadata JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status
      ON marketplace_listings (status);
    CREATE INDEX IF NOT EXISTS idx_marketplace_listings_category
      ON marketplace_listings (category);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS marketplace_reviews (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      listing_id UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
      author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL,
      body TEXT,
      status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (listing_id, author_id)
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_marketplace_reviews_listing
      ON marketplace_reviews (listing_id);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS trader_profiles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      display_name VARCHAR(128),
      description TEXT,
      trading_style VARCHAR(64),
      risk_style VARCHAR(32),
      verified BOOLEAN NOT NULL DEFAULT FALSE,
      metadata JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS trader_followers (
      id BIGSERIAL PRIMARY KEY,
      trader_id UUID NOT NULL REFERENCES trader_profiles(id) ON DELETE CASCADE,
      follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      followed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (trader_id, follower_id)
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS trader_behavior_metrics (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      trader_id UUID NOT NULL REFERENCES trader_profiles(id) ON DELETE CASCADE,
      consistency_score NUMERIC(5,2),
      discipline_score NUMERIC(5,2),
      average_holding_minutes INTEGER,
      average_rr NUMERIC(10,4),
      news_exposure_score NUMERIC(5,2),
      martingale_detected BOOLEAN NOT NULL DEFAULT FALSE,
      grid_detected BOOLEAN NOT NULL DEFAULT FALSE,
      recovery_trading_detected BOOLEAN NOT NULL DEFAULT FALSE,
      metadata JSONB,
      computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS trading_styles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      code VARCHAR(64) NOT NULL UNIQUE,
      label VARCHAR(128) NOT NULL,
      description TEXT
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS trader_style_assignments (
      id BIGSERIAL PRIMARY KEY,
      trader_id UUID NOT NULL REFERENCES trader_profiles(id) ON DELETE CASCADE,
      style_id UUID NOT NULL REFERENCES trading_styles(id) ON DELETE CASCADE,
      confidence NUMERIC(5,4),
      assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

export async function down(client) {
  await client.query(`DROP TABLE IF EXISTS trader_style_assignments CASCADE`);
  await client.query(`DROP TABLE IF EXISTS trading_styles CASCADE`);
  await client.query(`DROP TABLE IF EXISTS trader_behavior_metrics CASCADE`);
  await client.query(`DROP TABLE IF EXISTS trader_followers CASCADE`);
  await client.query(`DROP TABLE IF EXISTS trader_profiles CASCADE`);
  await client.query(`DROP TABLE IF EXISTS marketplace_reviews CASCADE`);
  await client.query(`DROP TABLE IF EXISTS marketplace_listings CASCADE`);
}