'use strict';

/**
 * Migration 030 - Align user_sessions with repository expectations
 *
 * The original identity migration (001) created user_sessions with a
 * `session_token` column and a `last_seen_at` timestamp. The auth
 * module writes hashed tokens, split into access and refresh, plus
 * device metadata and a `last_used_at` timestamp. This migration
 * brings the table in line with what the code actually uses.
 *
 * Strategy:
 *   - Rename `session_token` to `token_hash` (same data, clearer name).
 *   - Add `refresh_token_hash`, `device_id`, `device_type`,
 *     `device_label`, and `last_used_at` columns.
 *   - Leave the original `last_seen_at` and `revoked_reason` columns
 *     in place (harmless, may be used elsewhere).
 *
 * Idempotent: uses IF NOT EXISTS / conditional renames.
 *
 * @module server/database/migrations/030_align_user_sessions
 */

async function up(client) {
  // 1. Rename session_token -> token_hash if it still exists.
  await client.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_sessions'
          AND column_name = 'session_token'
      ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_sessions'
          AND column_name = 'token_hash'
      ) THEN
        ALTER TABLE user_sessions RENAME COLUMN session_token TO token_hash;
      END IF;
    END
    $$;
  `);

  // 2. Add the columns the repository expects.
  await client.query(`
    ALTER TABLE user_sessions
      ADD COLUMN IF NOT EXISTS refresh_token_hash VARCHAR(255),
      ADD COLUMN IF NOT EXISTS device_id VARCHAR(255),
      ADD COLUMN IF NOT EXISTS device_type VARCHAR(32) DEFAULT 'UNKNOWN',
      ADD COLUMN IF NOT EXISTS device_label VARCHAR(255),
      ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMPTZ DEFAULT NOW();
  `);

  // 3. Indexes the queries rely on.
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_user_sessions_refresh_token_hash
      ON user_sessions (refresh_token_hash)
      WHERE refresh_token_hash IS NOT NULL;
  `);
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_user_sessions_token_hash
      ON user_sessions (token_hash);
  `);
}

async function down(client) {
  await client.query(`
    ALTER TABLE user_sessions
      DROP COLUMN IF EXISTS last_used_at,
      DROP COLUMN IF EXISTS device_label,
      DROP COLUMN IF EXISTS device_type,
      DROP COLUMN IF EXISTS device_id,
      DROP COLUMN IF EXISTS refresh_token_hash;
  `);

  await client.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_sessions'
          AND column_name = 'token_hash'
      ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_sessions'
          AND column_name = 'session_token'
      ) THEN
        ALTER TABLE user_sessions RENAME COLUMN token_hash TO session_token;
      END IF;
    END
    $$;
  `);
}

module.exports.up = up;
module.exports.down = down;