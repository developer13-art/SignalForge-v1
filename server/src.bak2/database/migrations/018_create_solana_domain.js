/**
 * Migration 018 - Solana Domain
 *
 * @module server/database/migrations/018_create_solana_domain
 */

export async function up(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS solana_wallets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      wallet_address VARCHAR(64) NOT NULL,
      is_primary BOOLEAN NOT NULL DEFAULT FALSE,
      label VARCHAR(64),
      verified_at TIMESTAMPTZ,
      signature_proof TEXT,
      public_key VARCHAR(64),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (user_id, wallet_address)
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_solana_wallets_user
      ON solana_wallets (user_id);
    CREATE INDEX IF NOT EXISTS idx_solana_wallets_address
      ON solana_wallets (wallet_address);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS solana_attestations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      subject_type VARCHAR(32) NOT NULL,
      subject_id VARCHAR(128) NOT NULL,
      attestation_type VARCHAR(64) NOT NULL,
      attestation_hash VARCHAR(64) NOT NULL,
      public_data JSONB,
      on_chain_data JSONB,
      program_id VARCHAR(64),
      pda VARCHAR(64),
      tx_signature VARCHAR(128),
      slot BIGINT,
      block_time BIGINT,
      status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
      failure_reason TEXT,
      revoked_at TIMESTAMPTZ,
      revocation_reason TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      confirmed_at TIMESTAMPTZ,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_solana_attestations_subject
      ON solana_attestations (subject_type, subject_id);
    CREATE INDEX IF NOT EXISTS idx_solana_attestations_status
      ON solana_attestations (status);
    CREATE INDEX IF NOT EXISTS idx_solana_attestations_hash
      ON solana_attestations (attestation_hash);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS solana_provenance (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      signal_id UUID NOT NULL,
      provider_id UUID,
      processing_hash VARCHAR(64) NOT NULL,
      signal_hash VARCHAR(64),
      ai_version VARCHAR(64) NOT NULL,
      model_id VARCHAR(128),
      parser_type VARCHAR(32),
      processing_steps JSONB,
      public_data JSONB,
      program_id VARCHAR(64),
      pda VARCHAR(64),
      tx_signature VARCHAR(128),
      slot BIGINT,
      block_time BIGINT,
      status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
      failure_reason TEXT,
      anchored_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_solana_provenance_signal
      ON solana_provenance (signal_id);
    CREATE INDEX IF NOT EXISTS idx_solana_provenance_provider
      ON solana_provenance (provider_id);
    CREATE INDEX IF NOT EXISTS idx_solana_provenance_status
      ON solana_provenance (status);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS solana_payments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
      purpose VARCHAR(32) NOT NULL DEFAULT 'SUBSCRIPTION',
      amount NUMERIC(20,8) NOT NULL,
      token VARCHAR(8) NOT NULL,
      token_mint VARCHAR(64),
      sender_wallet VARCHAR(64),
      recipient_wallet VARCHAR(64) NOT NULL,
      reference VARCHAR(128) UNIQUE,
      memo VARCHAR(600),
      amount_usd NUMERIC(20,8),
      exchange_rate NUMERIC(20,8),
      tx_signature VARCHAR(128),
      slot BIGINT,
      block_time BIGINT,
      confirmations INTEGER,
      status VARCHAR(32) NOT NULL DEFAULT 'AWAITING_SIGNATURE',
      failure_reason TEXT,
      expires_at TIMESTAMPTZ,
      submitted_at TIMESTAMPTZ,
      confirmed_at TIMESTAMPTZ,
      finalized_at TIMESTAMPTZ,
      refunded_at TIMESTAMPTZ,
      refund_tx_signature VARCHAR(128),
      refund_reason TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_solana_payments_user
      ON solana_payments (user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_solana_payments_status
      ON solana_payments (status);
    CREATE INDEX IF NOT EXISTS idx_solana_payments_signature
      ON solana_payments (tx_signature);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS solana_transactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tx_signature VARCHAR(128) NOT NULL UNIQUE,
      purpose VARCHAR(64),
      reference_type VARCHAR(64),
      reference_id VARCHAR(128),
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
      slot BIGINT,
      block_time BIGINT,
      error_reason TEXT,
      raw_transaction JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      confirmed_at TIMESTAMPTZ,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_solana_transactions_status
      ON solana_transactions (status);
    CREATE INDEX IF NOT EXISTS idx_solana_transactions_user
      ON solana_transactions (user_id, created_at DESC);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS solana_indexer_checkpoints (
      program_id VARCHAR(64) PRIMARY KEY,
      last_processed_slot BIGINT NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS solana_indexer_events (
      id BIGSERIAL PRIMARY KEY,
      program_id VARCHAR(64) NOT NULL,
      event_type VARCHAR(64) NOT NULL,
      tx_signature VARCHAR(128) NOT NULL,
      slot BIGINT,
      payload JSONB,
      processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (tx_signature, event_type)
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_solana_indexer_events_program
      ON solana_indexer_events (program_id, slot);
  `);
}

export async function down(client) {
  await client.query(`DROP TABLE IF EXISTS solana_indexer_events CASCADE`);
  await client.query(`DROP TABLE IF EXISTS solana_indexer_checkpoints CASCADE`);
  await client.query(`DROP TABLE IF EXISTS solana_transactions CASCADE`);
  await client.query(`DROP TABLE IF EXISTS solana_payments CASCADE`);
  await client.query(`DROP TABLE IF EXISTS solana_provenance CASCADE`);
  await client.query(`DROP TABLE IF EXISTS solana_attestations CASCADE`);
  await client.query(`DROP TABLE IF EXISTS solana_wallets CASCADE`);
}