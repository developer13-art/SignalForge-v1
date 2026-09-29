'use strict';

/**
 * Migration 029 - Verification Tokens
 *
 * Creates the verification_tokens table used by the auth module for
 * email verification, phone verification, and password reset flows.
 *
 * Idempotent: uses IF NOT EXISTS and re-checks column additions so
 * the migration can be re-run safely.
 *
 * @module server/database/migrations/029_create_verification_tokens
 */

async function up(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS verification_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_type VARCHAR(32) NOT NULL,
      token_hash VARCHAR(255) NOT NULL UNIQUE,
      target VARCHAR(255),
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_verification_tokens_user_type
      ON verification_tokens (user_id, token_type);
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_verification_tokens_hash
      ON verification_tokens (token_hash);
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_verification_tokens_expires
      ON verification_tokens (expires_at);
  `);
}

async function down(client) {
  await client.query(`DROP TABLE IF EXISTS verification_tokens CASCADE;`);
}

module.exports.up = up;
module.exports.down = down;