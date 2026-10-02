'use strict';

/**
 * Migration 036 - Wallet Accounts
 *
 * Creates the wallet account table used by the wallet service and aligns
 * the payments ledger with the append-only wallet repository contract.
 */
async function up(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS wallets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
      wallet_type VARCHAR(32) NOT NULL DEFAULT 'USER',
      currency VARCHAR(8) NOT NULL DEFAULT 'USD',
      status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
      available_balance NUMERIC(20,8) NOT NULL DEFAULT 0,
      pending_balance NUMERIC(20,8) NOT NULL DEFAULT 0,
      reserved_balance NUMERIC(20,8) NOT NULL DEFAULT 0,
      total_balance NUMERIC(20,8) NOT NULL DEFAULT 0,
      lifetime_credited NUMERIC(20,8) NOT NULL DEFAULT 0,
      lifetime_debited NUMERIC(20,8) NOT NULL DEFAULT 0,
      frozen_reason TEXT,
      metadata JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT wallets_type_currency_user_unique UNIQUE (user_id, wallet_type, currency)
    );
  `);

  await client.query(`
    ALTER TABLE wallet_ledger
      ADD COLUMN IF NOT EXISTS wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
      ADD COLUMN IF NOT EXISTS direction VARCHAR(16),
      ADD COLUMN IF NOT EXISTS status VARCHAR(16) DEFAULT 'POSTED',
      ADD COLUMN IF NOT EXISTS metadata JSONB,
      ADD COLUMN IF NOT EXISTS recorded_at TIMESTAMPTZ;
  `);

  // Preserve existing signed-ledger balances while adding wallet accounts.
  await client.query(`
    INSERT INTO wallets (
      user_id, wallet_type, currency, status, available_balance, total_balance,
      lifetime_credited, lifetime_debited
    )
    SELECT user_id, 'USER', currency, 'ACTIVE',
           GREATEST(SUM(amount), 0), GREATEST(SUM(amount), 0),
           SUM(GREATEST(amount, 0)), SUM(GREATEST(-amount, 0))
      FROM wallet_ledger
     GROUP BY user_id, currency
    ON CONFLICT (user_id, wallet_type, currency) DO NOTHING;
  `);

  await client.query(`
    UPDATE wallet_ledger AS entry
       SET wallet_id = wallet.id
      FROM wallets AS wallet
     WHERE entry.wallet_id IS NULL
       AND wallet.user_id = entry.user_id
       AND wallet.wallet_type = 'USER'
       AND wallet.currency = entry.currency;
  `);

  await client.query(`
    UPDATE wallet_ledger
       SET direction = CASE WHEN amount < 0 THEN 'DEBIT' ELSE 'CREDIT' END,
           amount = ABS(amount),
           status = COALESCE(status, 'POSTED'),
           recorded_at = COALESCE(recorded_at, created_at, NOW());
  `);

  await client.query(`
    ALTER TABLE wallet_ledger
      ALTER COLUMN wallet_id SET NOT NULL,
      ALTER COLUMN direction SET DEFAULT 'CREDIT',
      ALTER COLUMN direction SET NOT NULL,
      ALTER COLUMN status SET DEFAULT 'POSTED',
      ALTER COLUMN status SET NOT NULL,
      ALTER COLUMN recorded_at SET DEFAULT NOW(),
      ALTER COLUMN recorded_at SET NOT NULL;
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_wallets_user_status
      ON wallets (user_id, status);
    CREATE INDEX IF NOT EXISTS idx_wallet_ledger_wallet_time
      ON wallet_ledger (wallet_id, recorded_at DESC);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_wallet_ledger_seed_once
      ON wallet_ledger (reference_type, reference_id)
      WHERE reference_type = 'SEED_TOP_UP' AND reference_id IS NOT NULL;
    DROP TRIGGER IF EXISTS trg_wallets_updated_at ON wallets;
    CREATE TRIGGER trg_wallets_updated_at
      BEFORE UPDATE ON wallets
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  `);

  await client.query(`
    CREATE OR REPLACE FUNCTION append_wallet_ledger_entry(
      p_user_id UUID,
      p_entry_type VARCHAR,
      p_amount NUMERIC,
      p_currency VARCHAR,
      p_reference_type VARCHAR,
      p_reference_id UUID,
      p_description TEXT
    )
    RETURNS BIGINT AS $$
    DECLARE
      wallet_row RECORD;
      current_balance NUMERIC;
      new_balance NUMERIC;
      new_entry_id BIGINT;
      entry_direction VARCHAR(16);
    BEGIN
      INSERT INTO wallets (user_id, wallet_type, currency)
      VALUES (p_user_id, 'USER', COALESCE(p_currency, 'USD'))
      ON CONFLICT (user_id, wallet_type, currency) DO NOTHING;

      SELECT id, available_balance, total_balance
        INTO wallet_row
        FROM wallets
       WHERE user_id = p_user_id
         AND wallet_type = 'USER'
         AND currency = COALESCE(p_currency, 'USD')
       FOR UPDATE;

      IF p_amount < 0 AND wallet_row.available_balance < ABS(p_amount) THEN
        RAISE EXCEPTION 'Insufficient wallet balance for user %', p_user_id;
      END IF;

      current_balance := wallet_row.total_balance;
      new_balance := current_balance + p_amount;
      entry_direction := CASE WHEN p_amount < 0 THEN 'DEBIT' ELSE 'CREDIT' END;

      INSERT INTO wallet_ledger (
        wallet_id, user_id, entry_type, direction, amount, currency,
        balance_before, balance_after, reference_type, reference_id,
        description, status, recorded_at, created_at
      ) VALUES (
        wallet_row.id, p_user_id, p_entry_type, entry_direction, ABS(p_amount),
        COALESCE(p_currency, 'USD'), current_balance, new_balance,
        p_reference_type, p_reference_id, p_description, 'POSTED', NOW(), NOW()
      ) RETURNING id INTO new_entry_id;

      UPDATE wallets
         SET available_balance = available_balance + p_amount,
             total_balance = new_balance,
             lifetime_credited = lifetime_credited + GREATEST(p_amount, 0),
             lifetime_debited = lifetime_debited + GREATEST(-p_amount, 0)
       WHERE id = wallet_row.id;

      RETURN new_entry_id;
    END;
    $$ LANGUAGE plpgsql;
  `);
}

async function down(client) {
  await client.query(`
    CREATE OR REPLACE FUNCTION append_wallet_ledger_entry(
      p_user_id UUID,
      p_entry_type VARCHAR,
      p_amount NUMERIC,
      p_currency VARCHAR,
      p_reference_type VARCHAR,
      p_reference_id UUID,
      p_description TEXT
    )
    RETURNS BIGINT AS $$
    DECLARE
      current_balance NUMERIC;
      new_balance NUMERIC;
      new_entry_id BIGINT;
    BEGIN
      SELECT COALESCE(SUM(amount), 0)
        INTO current_balance
        FROM wallet_ledger
       WHERE user_id = p_user_id AND currency = p_currency;

      new_balance := current_balance + p_amount;

      INSERT INTO wallet_ledger (
        user_id, entry_type, amount, currency, balance_before,
        balance_after, reference_type, reference_id, description
      ) VALUES (
        p_user_id, p_entry_type, p_amount, p_currency, current_balance,
        new_balance, p_reference_type, p_reference_id, p_description
      ) RETURNING id INTO new_entry_id;

      RETURN new_entry_id;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await client.query(`DROP TRIGGER IF EXISTS trg_wallets_updated_at ON wallets`);
  await client.query(`DROP INDEX IF EXISTS idx_wallet_ledger_seed_once`);
  await client.query(`DROP INDEX IF EXISTS idx_wallet_ledger_wallet_time`);
  await client.query(`DROP INDEX IF EXISTS idx_wallets_user_status`);
  await client.query(`ALTER TABLE wallet_ledger DROP COLUMN IF EXISTS wallet_id`);
  await client.query(`ALTER TABLE wallet_ledger DROP COLUMN IF EXISTS direction`);
  await client.query(`ALTER TABLE wallet_ledger DROP COLUMN IF EXISTS status`);
  await client.query(`ALTER TABLE wallet_ledger DROP COLUMN IF EXISTS metadata`);
  await client.query(`ALTER TABLE wallet_ledger DROP COLUMN IF EXISTS recorded_at`);
  await client.query(`DROP TABLE IF EXISTS wallets CASCADE`);
}

module.exports.up = up;
module.exports.down = down;