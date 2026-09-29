'use strict';

/**
 * Migration 031 - Finalize user_sessions column alignment
 *
 * Migration 030 was intended to rename session_token to token_hash,
 * but its ADD COLUMN IF NOT EXISTS clause created a fresh token_hash
 * column while session_token remained. The result is two columns
 * with the same purpose, and the NOT NULL constraint on the unused
 * session_token column rejects every insert.
 *
 * This migration finishes the job:
 *   1. Copies any data from session_token into token_hash.
 *   2. Drops the NOT NULL and UNIQUE constraints on session_token.
 *   3. Drops the session_token column.
 *   4. Adds the NOT NULL and UNIQUE constraints on token_hash.
 *
 * Idempotent: uses IF EXISTS / information_schema checks so it can
 * be re-run safely.
 *
 * @module server/database/migrations/031_finalize_session_token_rename
 */

async function up(client) {
  // 1. If both columns exist, copy the data across for any rows that
  //    still only have a value in session_token.
  await client.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_sessions'
          AND column_name = 'session_token'
      ) AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_sessions'
          AND column_name = 'token_hash'
      ) THEN
        UPDATE user_sessions
           SET token_hash = session_token
         WHERE token_hash IS NULL
           AND session_token IS NOT NULL;
      END IF;
    END
    $$;
  `);

  // 2. Drop any NOT NULL constraint on session_token so we can proceed
  //    regardless of the state.
  await client.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_sessions'
          AND column_name = 'session_token'
          AND is_nullable = 'NO'
      ) THEN
        ALTER TABLE user_sessions ALTER COLUMN session_token DROP NOT NULL;
      END IF;
    END
    $$;
  `);

  // 3. Drop the unique constraint on session_token if it exists.
  await client.query(`
    DO $$
    DECLARE
      constraint_name text;
    BEGIN
      SELECT con.conname INTO constraint_name
        FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_attribute att ON att.attrelid = rel.oid AND att.attnum = ANY (con.conkey)
       WHERE rel.relname = 'user_sessions'
         AND att.attname = 'session_token'
         AND con.contype = 'u'
       LIMIT 1;

      IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE user_sessions DROP CONSTRAINT %I', constraint_name);
      END IF;
    END
    $$;
  `);

  // 4. Drop the leftover session_token column.
  await client.query(`
    ALTER TABLE user_sessions DROP COLUMN IF EXISTS session_token;
  `);

  // 5. Ensure token_hash has NOT NULL and UNIQUE.
  await client.query(`
    ALTER TABLE user_sessions
      ALTER COLUMN token_hash SET NOT NULL;
  `);

  await client.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_attribute att ON att.attrelid = rel.oid AND att.attnum = ANY (con.conkey)
       WHERE rel.relname = 'user_sessions'
         AND att.attname = 'token_hash'
         AND con.contype = 'u'
      ) THEN
        ALTER TABLE user_sessions ADD CONSTRAINT user_sessions_token_hash_key UNIQUE (token_hash);
      END IF;
    END
    $$;
  `);
}

async function down(client) {
  // Recreate session_token as a nullable column so nothing breaks if
  // the migration is reversed.
  await client.query(`
    ALTER TABLE user_sessions
      ADD COLUMN IF NOT EXISTS session_token VARCHAR(255);
  `);

  await client.query(`
    UPDATE user_sessions
       SET session_token = token_hash
     WHERE session_token IS NULL
       AND token_hash IS NOT NULL;
  `);

  // Do not drop token_hash on rollback; it is the repository's target.
}

module.exports.up = up;
module.exports.down = down;