'use strict';

/**
 * SignalForge - Migration 024
 *
 * Creates the Proof of Alpha domain: proof records, memo submissions,
 * verifications, fetches, and the leaderboard cache and history. All
 * tables are additive and never alter existing tables.
 */

module.exports = {
  name: '024_create_proof_of_alpha_domain',

  async up(client) {
    await client.query(`
      CREATE TABLE IF NOT EXISTS solana_proof_records (
        id TEXT PRIMARY KEY,
        provider_id TEXT NOT NULL,
        trade_id TEXT NULL,
        kind TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        verification_level TEXT NOT NULL DEFAULT 'unverified',
        memo_version INT NOT NULL DEFAULT 1,
        memo_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
        memo_hash TEXT NULL,
        memo_bytes INT NOT NULL DEFAULT 0,
        signature TEXT NULL,
        reference TEXT NULL,
        block_slot BIGINT NULL,
        block_time BIGINT NULL,
        authority_public_key TEXT NULL,
        raw_response JSONB NULL,
        error_message TEXT NULL,
        submitted_at TIMESTAMPTZ NULL,
        confirmed_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_proof_records_provider_id
        ON solana_proof_records (provider_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_proof_records_trade_id
        ON solana_proof_records (trade_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_proof_records_kind
        ON solana_proof_records (kind);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_proof_records_status
        ON solana_proof_records (status);
    `);
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_solana_proof_records_signature
        ON solana_proof_records (signature)
        WHERE signature IS NOT NULL;
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_proof_records_created_at
        ON solana_proof_records (created_at DESC);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_proof_records_confirmed_at
        ON solana_proof_records (confirmed_at DESC NULLS LAST);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_proof_records_provider_kind_status
        ON solana_proof_records (provider_id, kind, status);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS solana_proof_memo_submissions (
        id TEXT PRIMARY KEY,
        proof_id TEXT NULL REFERENCES solana_proof_records(id) ON DELETE SET NULL,
        provider_id TEXT NOT NULL,
        trade_id TEXT NULL,
        kind TEXT NOT NULL,
        memo_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
        memo_string TEXT NULL,
        memo_hash TEXT NULL,
        memo_bytes INT NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'pending',
        attempt INT NOT NULL DEFAULT 1,
        max_attempts INT NOT NULL DEFAULT 5,
        signature TEXT NULL,
        reference TEXT NULL,
        error_message TEXT NULL,
        submitted_at TIMESTAMPTZ NULL,
        confirmed_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_proof_memo_submissions_proof_id
        ON solana_proof_memo_submissions (proof_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_proof_memo_submissions_provider_id
        ON solana_proof_memo_submissions (provider_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_proof_memo_submissions_status
        ON solana_proof_memo_submissions (status);
    `);
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_solana_proof_memo_submissions_signature
        ON solana_proof_memo_submissions (signature)
        WHERE signature IS NOT NULL;
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_proof_memo_submissions_created_at
        ON solana_proof_memo_submissions (created_at DESC);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_proof_memo_submissions_updated_at
        ON solana_proof_memo_submissions (updated_at ASC);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS solana_proof_verifications (
        id TEXT PRIMARY KEY,
        proof_id TEXT NULL REFERENCES solana_proof_records(id) ON DELETE SET NULL,
        signature TEXT NOT NULL,
        provider_id TEXT NULL,
        trade_id TEXT NULL,
        level TEXT NOT NULL DEFAULT 'verified',
        valid BOOLEAN NOT NULL DEFAULT FALSE,
        memo_hash TEXT NULL,
        on_chain_hash TEXT NULL,
        matches BOOLEAN NOT NULL DEFAULT FALSE,
        verifier TEXT NOT NULL DEFAULT 'signalforge',
        reason TEXT NULL,
        raw_response JSONB NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_proof_verifications_signature
        ON solana_proof_verifications (signature);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_proof_verifications_proof_id
        ON solana_proof_verifications (proof_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_proof_verifications_provider_id
        ON solana_proof_verifications (provider_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_proof_verifications_created_at
        ON solana_proof_verifications (created_at DESC);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS solana_proof_fetches (
        id TEXT PRIMARY KEY,
        signature TEXT NOT NULL,
        slot BIGINT NULL,
        block_time BIGINT NULL,
        confirmation_status TEXT NULL,
        memo_text TEXT NULL,
        authority TEXT NULL,
        reference TEXT NULL,
        err JSONB NULL,
        raw_transaction JSONB NULL,
        fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_proof_fetches_signature
        ON solana_proof_fetches (signature);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_proof_fetches_authority
        ON solana_proof_fetches (authority);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_proof_fetches_reference
        ON solana_proof_fetches (reference);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_proof_fetches_fetched_at
        ON solana_proof_fetches (fetched_at DESC);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS solana_leaderboard_cache (
        id TEXT PRIMARY KEY,
        window TEXT NOT NULL,
        sort_by TEXT NOT NULL,
        rank INT NOT NULL,
        provider_id TEXT NOT NULL,
        provider_name TEXT NULL,
        provider_avatar_url TEXT NULL,
        total_trades INT NOT NULL DEFAULT 0,
        winning_trades INT NOT NULL DEFAULT 0,
        losing_trades INT NOT NULL DEFAULT 0,
        break_even_trades INT NOT NULL DEFAULT 0,
        win_rate NUMERIC(8, 4) NOT NULL DEFAULT 0,
        total_pnl_usd NUMERIC(24, 4) NOT NULL DEFAULT 0,
        average_pnl_percent NUMERIC(12, 4) NOT NULL DEFAULT 0,
        profit_factor NUMERIC(12, 4) NOT NULL DEFAULT 0,
        verified_trades INT NOT NULL DEFAULT 0,
        verification_level TEXT NOT NULL DEFAULT 'unverified',
        consistency_score NUMERIC(10, 4) NULL,
        sharpe_like NUMERIC(10, 4) NULL,
        last_verified_at TIMESTAMPTZ NULL,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_leaderboard_cache_window_sort
        ON solana_leaderboard_cache (window, sort_by);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_leaderboard_cache_provider
        ON solana_leaderboard_cache (provider_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_leaderboard_cache_rank
        ON solana_leaderboard_cache (window, sort_by, rank ASC);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS solana_leaderboard_history (
        id TEXT PRIMARY KEY,
        window TEXT NOT NULL,
        sort_by TEXT NOT NULL,
        count INT NOT NULL DEFAULT 0,
        generated_by TEXT NULL,
        duration_ms INT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_leaderboard_history_window_sort
        ON solana_leaderboard_history (window, sort_by);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_leaderboard_history_created_at
        ON solana_leaderboard_history (created_at DESC);
    `);
  },

  async down(client) {
    await client.query('DROP TABLE IF EXISTS solana_leaderboard_history;');
    await client.query('DROP TABLE IF EXISTS solana_leaderboard_cache;');
    await client.query('DROP TABLE IF EXISTS solana_proof_fetches;');
    await client.query('DROP TABLE IF EXISTS solana_proof_verifications;');
    await client.query('DROP TABLE IF EXISTS solana_proof_memo_submissions;');
    await client.query('DROP TABLE IF EXISTS solana_proof_records;');
  },
};