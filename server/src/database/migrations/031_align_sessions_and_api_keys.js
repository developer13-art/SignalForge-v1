'use strict';

/**
 * Migration 031 - Align user_sessions and api_keys with AuthRepository
 *
 * Migration 001 created user_sessions with a slightly different column
 * set than the AuthRepository expects, and migration 017 did the same
 * for api_keys. This migration adds every missing column so that the
 * repository's SQL works unchanged, backfills sensible defaults, and
 * leaves the existing columns in place so that nothing else that
 * references them breaks.
 *
 * Idempotent: uses IF NOT EXISTS for every column addition.
 *
 * @module server/database/migrations/031_align_sessions_and_api_keys
 */

async function up(client) {
  // ---------- user_sessions ----------

  await client.query(`
    ALTER TABLE user_sessions
      ADD COLUMN IF NOT EXISTS token_hash VARCHAR(255),
      ADD COLUMN IF NOT EXISTS refresh_token_hash VARCHAR(255),
      ADD COLUMN IF NOT EXISTS device_id VARCHAR(255),
      ADD COLUMN IF NOT EXISTS device_type VARCHAR(32) DEFAULT 'UNKNOWN',
      ADD COLUMN IF NOT EXISTS device_label VARCHAR(255),
      ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMPTZ DEFAULT NOW();
  `);

  // Backfill token_hash from the existing session_token column so that
  // already-issued sessions remain resolvable.
  await client.query(`
    UPDATE user_sessions
       SET token_hash = session_token
     WHERE token_hash IS NULL
       AND session_token IS NOT NULL;
  `);

  // Backfill last_used_at from the existing last_seen_at column.
  await client.query(`
    UPDATE user_sessions
       SET last_used_at = last_seen_at
     WHERE last_used_at IS NULL
       AND last_seen_at IS NOT NULL;
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_user_sessions_token_hash
      ON user_sessions (token_hash);
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_user_sessions_refresh_token_hash
      ON user_sessions (refresh_token_hash);
  `);

  // ---------- api_keys ----------

  await client.query(`
    ALTER TABLE api_keys
      ADD COLUMN IF NOT EXISTS prefix VARCHAR(32),
      ADD COLUMN IF NOT EXISTS ip_whitelist JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS last_used_ip INET;
  `);

  // Backfill prefix from the existing key_prefix column.
  await client.query(`
    UPDATE api_keys
       SET prefix = key_prefix
     WHERE prefix IS NULL
       AND key_prefix IS NOT NULL;
  `);

  // The repository writes to `prefix` and reads from it, so prefix must
  // be unique. Ensure the unique index exists.
  await client.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_api_keys_prefix
      ON api_keys (prefix)
      WHERE prefix IS NOT NULL;
  `);
}

async function down(client) {
  await client.query(`DROP INDEX IF EXISTS idx_api_keys_prefix;`);
  await client.query(`
    ALTER TABLE api_keys
      DROP COLUMN IF EXISTS last_used_ip,
      DROP COLUMN IF EXISTS ip_whitelist,
      DROP COLUMN IF EXISTS prefix;
  `);

  await client.query(`DROP INDEX IF EXISTS idx_user_sessions_refresh_token_hash;`);
  await client.query(`DROP INDEX IF EXISTS idx_user_sessions_token_hash;`);
  await client.query(`
    ALTER TABLE user_sessions
      DROP COLUMN IF EXISTS last_used_at,
      DROP COLUMN IF EXISTS device_label,
      DROP COLUMN IF EXISTS device_type,
      DROP COLUMN IF EXISTS device_id,
      DROP COLUMN IF EXISTS refresh_token_hash,
      DROP COLUMN IF EXISTS token_hash;
  `);
}

module.exports.up = up;
module.exports.down = down;