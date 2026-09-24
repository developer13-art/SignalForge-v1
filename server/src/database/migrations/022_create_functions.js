/**
 * Migration 022 - Functions
 *
 * Database functions used for common atomic operations such as
 * ledger-appended balance updates and job locking.
 *
 * @module server/database/migrations/022_create_functions
 */

export async function up(client) {
  await client.query(`
    CREATE OR REPLACE FUNCTION acquire_job_lock(
      p_job_id UUID,
      p_worker_id VARCHAR
    )
    RETURNS BOOLEAN AS $$
    DECLARE
      updated INT;
    BEGIN
      UPDATE jobs
         SET status = 'RUNNING',
             locked_by = p_worker_id,
             locked_at = NOW(),
             started_at = COALESCE(started_at, NOW()),
             updated_at = NOW()
       WHERE id = p_job_id
         AND status IN ('PENDING', 'RETRYING')
         AND locked_at IS NULL;

      GET DIAGNOSTICS updated = ROW_COUNT;
      RETURN updated > 0;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await client.query(`
    CREATE OR REPLACE FUNCTION release_job_lock(
      p_job_id UUID
    )
    RETURNS VOID AS $$
    BEGIN
      UPDATE jobs
         SET locked_by = NULL,
             locked_at = NULL,
             updated_at = NOW()
       WHERE id = p_job_id;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await client.query(`
    CREATE OR REPLACE FUNCTION append_referral_ledger_entry(
      p_wallet_id UUID,
      p_entry_type VARCHAR,
      p_amount NUMERIC,
      p_currency VARCHAR,
      p_reference_type VARCHAR,
      p_reference_id UUID,
      p_description TEXT
    )
    RETURNS UUID AS $$
    DECLARE
      current_balance NUMERIC;
      new_balance NUMERIC;
      new_entry_id UUID;
    BEGIN
      SELECT available_balance INTO current_balance
        FROM referral_wallets
       WHERE id = p_wallet_id
       FOR UPDATE;

      IF current_balance IS NULL THEN
        RAISE EXCEPTION 'Wallet not found: %', p_wallet_id;
      END IF;

      new_balance := current_balance + p_amount;

      INSERT INTO referral_ledger (
        wallet_id, entry_type, amount, currency,
        balance_before, balance_after,
        reference_type, reference_id, description
      )
      VALUES (
        p_wallet_id, p_entry_type, p_amount, p_currency,
        current_balance, new_balance,
        p_reference_type, p_reference_id, p_description
      )
      RETURNING id INTO new_entry_id;

      UPDATE referral_wallets
         SET available_balance = new_balance,
             updated_at = NOW()
       WHERE id = p_wallet_id;

      RETURN new_entry_id;
    END;
    $$ LANGUAGE plpgsql;
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
        user_id, entry_type, amount, currency,
        balance_before, balance_after,
        reference_type, reference_id, description
      )
      VALUES (
        p_user_id, p_entry_type, p_amount, p_currency,
        current_balance, new_balance,
        p_reference_type, p_reference_id, p_description
      )
      RETURNING id INTO new_entry_id;

      RETURN new_entry_id;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await client.query(`
    CREATE OR REPLACE FUNCTION generate_referral_code()
    RETURNS VARCHAR AS $$
    DECLARE
      candidate VARCHAR(32);
      exists_count INT;
    BEGIN
      LOOP
        candidate := 'SF' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
        SELECT COUNT(*) INTO exists_count FROM referral_codes WHERE code = candidate;
        IF exists_count = 0 THEN
          RETURN candidate;
        END IF;
      END LOOP;
    END;
    $$ LANGUAGE plpgsql;
  `);
}

export async function down(client) {
  await client.query(`DROP FUNCTION IF EXISTS generate_referral_code()`);
  await client.query(`DROP FUNCTION IF EXISTS append_wallet_ledger_entry(UUID, VARCHAR, NUMERIC, VARCHAR, VARCHAR, UUID, TEXT)`);
  await client.query(`DROP FUNCTION IF EXISTS append_referral_ledger_entry(UUID, VARCHAR, NUMERIC, VARCHAR, VARCHAR, UUID, TEXT)`);
  await client.query(`DROP FUNCTION IF EXISTS release_job_lock(UUID)`);
  await client.query(`DROP FUNCTION IF EXISTS acquire_job_lock(UUID, VARCHAR)`);
}