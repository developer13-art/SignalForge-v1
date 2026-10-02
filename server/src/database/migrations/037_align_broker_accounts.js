/**
 * Migration 037 - Align broker accounts with encrypted account storage.
 *
 * @module server/database/migrations/037_align_broker_accounts
 */
async function up(client) {
  await client.query(`
    ALTER TABLE broker_accounts
      ADD COLUMN IF NOT EXISTS broker_name VARCHAR(128),
      ADD COLUMN IF NOT EXISTS account_number_hash CHAR(64),
      ADD COLUMN IF NOT EXISTS account_number_masked VARCHAR(32),
      ADD COLUMN IF NOT EXISTS credentials_encrypted TEXT,
      ADD COLUMN IF NOT EXISTS metaapi_region VARCHAR(128),
      ADD COLUMN IF NOT EXISTS margin_level NUMERIC(20,8),
      ADD COLUMN IF NOT EXISTS last_error TEXT,
      ADD COLUMN IF NOT EXISTS last_error_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS connected_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS disconnected_at TIMESTAMPTZ;
  `);

  await client.query(`
    UPDATE broker_accounts AS accounts
       SET broker_name = brokers.name
      FROM brokers
     WHERE accounts.broker_id = brokers.id
       AND accounts.broker_name IS NULL;
  `);

  await client.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_broker_accounts_user_number_server
      ON broker_accounts (user_id, account_number_hash, server)
      WHERE account_number_hash IS NOT NULL;
  `);
}

async function down(client) {
  await client.query('DROP INDEX IF EXISTS idx_broker_accounts_user_number_server');
}

module.exports.up = up;
module.exports.down = down;