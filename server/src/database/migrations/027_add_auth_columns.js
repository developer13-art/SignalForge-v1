'use strict';

/**
 * Migration 027 - Auth Columns
 *
 * Adds the authentication support columns that the AuthRepository
 * expects but that were not present in migration 001:
 *
 *   users.failed_login_attempts  INTEGER  default 0
 *   users.locked_until           TIMESTAMPTZ
 *   users.last_login_ip          INET
 *   users.password_changed_at    TIMESTAMPTZ
 *
 * Idempotent: uses IF NOT EXISTS so it can be re-run safely.
 *
 * @module server/database/migrations/027_add_auth_columns
 */

async function up(client) {
  await client.query(`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS last_login_ip INET,
      ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ;
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_users_locked_until
      ON users (locked_until)
      WHERE locked_until IS NOT NULL;
  `);
}

async function down(client) {
  await client.query(`
    DROP INDEX IF EXISTS idx_users_locked_until;
  `);

  await client.query(`
    ALTER TABLE users
      DROP COLUMN IF EXISTS password_changed_at,
      DROP COLUMN IF EXISTS last_login_ip,
      DROP COLUMN IF EXISTS locked_until,
      DROP COLUMN IF EXISTS failed_login_attempts;
  `);
}

module.exports.up = up;
module.exports.down = down;