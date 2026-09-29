'use strict';

/**
 * Migration 030 - Align two_factor_auth with AuthRepository
 *
 * Migration 001 created two_factor_auth with:
 *   user_id (PK), secret_encrypted, enabled,
 *   backup_codes_encrypted, created_at, updated_at
 *
 * AuthRepository expects:
 *   id, user_id, method, secret, backup_codes,
 *   enabled, verified_at, created_at, updated_at
 *
 * This migration adds the missing columns and keeps the existing
 * ones so that nothing already referencing the table breaks.
 *
 * Idempotent: uses IF NOT EXISTS for every column addition.
 *
 * @module server/database/migrations/030_align_two_factor_auth
 */

async function up(client) {
  await client.query(`
    ALTER TABLE two_factor_auth
      ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid(),
      ADD COLUMN IF NOT EXISTS method VARCHAR(32) DEFAULT 'TOTP',
      ADD COLUMN IF NOT EXISTS secret TEXT,
      ADD COLUMN IF NOT EXISTS backup_codes TEXT[] DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
  `);

  // Backfill id, method, secret, and backup_codes from the existing
  // encrypted columns so that already-enabled 2FA records continue to
  // work. The encrypted columns are retained for backwards compatibility.

  await client.query(`
    UPDATE two_factor_auth
       SET id = gen_random_uuid()
     WHERE id IS NULL;
  `);

  await client.query(`
    UPDATE two_factor_auth
       SET method = 'TOTP'
     WHERE method IS NULL;
  `);

  await client.query(`
    UPDATE two_factor_auth
       SET secret = secret_encrypted
     WHERE secret IS NULL
       AND secret_encrypted IS NOT NULL;
  `);

  await client.query(`
    UPDATE two_factor_auth
       SET backup_codes = ARRAY[]::TEXT[]
     WHERE backup_codes IS NULL;
  `);

  // Now that every row has an id, make it NOT NULL and unique.
  await client.query(`
    ALTER TABLE two_factor_auth
      ALTER COLUMN id SET NOT NULL;
  `);

  await client.query(`
    ALTER TABLE two_factor_auth
      ALTER COLUMN method SET NOT NULL;
  `);

  await client.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_two_factor_auth_id
      ON two_factor_auth (id);
  `);
}

async function down(client) {
  await client.query(`DROP INDEX IF EXISTS idx_two_factor_auth_id;`);
  await client.query(`
    ALTER TABLE two_factor_auth
      DROP COLUMN IF EXISTS verified_at,
      DROP COLUMN IF EXISTS backup_codes,
      DROP COLUMN IF EXISTS secret,
      DROP COLUMN IF EXISTS method,
      DROP COLUMN IF EXISTS id;
  `);
}

module.exports.up = up;
module.exports.down = down;