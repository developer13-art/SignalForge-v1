/**
 * Migration 001 - Identity Domain
 *
 * Creates the users, profiles, sessions, and two-factor tables that
 * form the identity foundation of the platform.
 *
 * @module server/database/migrations/001_create_identity_domain
 */

export async function up(client) {
  await client.query(`
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(254) NOT NULL UNIQUE,
      phone VARCHAR(32),
      password_hash VARCHAR(255) NOT NULL,
      first_name VARCHAR(128),
      middle_name VARCHAR(128),
      last_name VARCHAR(128),
      username VARCHAR(64) UNIQUE,
      avatar_url TEXT,
      status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
      kyc_status VARCHAR(32) NOT NULL DEFAULT 'NOT_STARTED',
      account_type VARCHAR(32) NOT NULL DEFAULT 'USER',
      email_verified_at TIMESTAMPTZ,
      phone_verified_at TIMESTAMPTZ,
      last_login_at TIMESTAMPTZ,
      deleted_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users (LOWER(email));
    CREATE INDEX IF NOT EXISTS idx_users_status ON users (status);
    CREATE INDEX IF NOT EXISTS idx_users_kyc_status ON users (kyc_status);
    CREATE INDEX IF NOT EXISTS idx_users_created_at ON users (created_at DESC);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS user_profiles (
      user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      date_of_birth DATE,
      nationality VARCHAR(3),
      country VARCHAR(3),
      city VARCHAR(128),
      address_line1 VARCHAR(255),
      address_line2 VARCHAR(255),
      postal_code VARCHAR(32),
      timezone VARCHAR(64) DEFAULT 'UTC',
      language VARCHAR(8) DEFAULT 'en',
      trading_experience VARCHAR(32),
      referred_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      metadata JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS user_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      session_token VARCHAR(255) NOT NULL UNIQUE,
      ip_address INET,
      user_agent TEXT,
      geo_country VARCHAR(3),
      geo_city VARCHAR(128),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ,
      revoked_at TIMESTAMPTZ,
      revoked_reason VARCHAR(255)
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_user_sessions_user_active
      ON user_sessions (user_id)
      WHERE revoked_at IS NULL;
    CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions (session_token);
    CREATE INDEX IF NOT EXISTS idx_user_sessions_last_seen ON user_sessions (last_seen_at DESC);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS two_factor_auth (
      user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      secret_encrypted TEXT NOT NULL,
      enabled BOOLEAN NOT NULL DEFAULT FALSE,
      backup_codes_encrypted TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS user_devices (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      device_fingerprint VARCHAR(255),
      platform VARCHAR(32),
      push_token TEXT,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      last_seen_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_user_devices_user ON user_devices (user_id) WHERE active = TRUE;
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS login_attempts (
      id BIGSERIAL PRIMARY KEY,
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      email VARCHAR(254),
      ip_address INET,
      user_agent TEXT,
      success BOOLEAN NOT NULL,
      reason VARCHAR(255),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_login_attempts_user_created
      ON login_attempts (user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_login_attempts_email_created
      ON login_attempts (email, created_at DESC);
  `);
}

export async function down(client) {
  await client.query(`DROP TABLE IF EXISTS login_attempts CASCADE`);
  await client.query(`DROP TABLE IF EXISTS user_devices CASCADE`);
  await client.query(`DROP TABLE IF EXISTS two_factor_auth CASCADE`);
  await client.query(`DROP TABLE IF EXISTS user_sessions CASCADE`);
  await client.query(`DROP TABLE IF EXISTS user_profiles CASCADE`);
  await client.query(`DROP TABLE IF EXISTS users CASCADE`);
}