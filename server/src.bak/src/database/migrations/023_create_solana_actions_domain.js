'use strict';

/**
 * SignalForge - Migration 023
 *
 * Creates the Solana Actions and Blinks domain: Blinks, Blink templates,
 * Blink shares, Blink clicks, Blink conversions, Blink receipts, Solana
 * Actions confirmations, and Solana Actions idempotency keys.
 *
 * All tables are additive and never alter existing tables.
 */

module.exports = {
  name: '023_create_solana_actions_domain',

  async up(client) {
    await client.query(`
      CREATE TABLE IF NOT EXISTS solana_blinks (
        id TEXT PRIMARY KEY,
        provider_id TEXT NULL,
        owner_user_id TEXT NULL,
        template_type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        label TEXT NOT NULL,
        message TEXT NOT NULL DEFAULT '',
        icon_url TEXT NULL,
        website TEXT NULL,
        plan_id TEXT NULL,
        referral_code TEXT NULL,
        token_symbol TEXT NOT NULL,
        token_mint TEXT NOT NULL,
        amount NUMERIC(24, 9) NOT NULL DEFAULT 0,
        amount_decimals INT NULL,
        chain_id TEXT NULL,
        network TEXT NOT NULL,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_blinks_owner_user_id
        ON solana_blinks (owner_user_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_blinks_provider_id
        ON solana_blinks (provider_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_blinks_template_type
        ON solana_blinks (template_type);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_blinks_status
        ON solana_blinks (status);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_blinks_created_at
        ON solana_blinks (created_at DESC);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS solana_blink_templates (
        id TEXT PRIMARY KEY,
        owner_user_id TEXT NULL,
        provider_id TEXT NULL,
        template_type TEXT NOT NULL,
        name TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        label TEXT NOT NULL,
        message TEXT NOT NULL DEFAULT '',
        icon_url TEXT NULL,
        website TEXT NULL,
        plan_id TEXT NULL,
        referral_code TEXT NULL,
        token_symbol TEXT NOT NULL,
        token_mint TEXT NOT NULL,
        amount NUMERIC(24, 9) NOT NULL DEFAULT 0,
        amount_decimals INT NULL,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_blink_templates_owner_user_id
        ON solana_blink_templates (owner_user_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_blink_templates_provider_id
        ON solana_blink_templates (provider_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_blink_templates_template_type
        ON solana_blink_templates (template_type);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS solana_blink_shares (
        id TEXT PRIMARY KEY,
        blink_id TEXT NOT NULL REFERENCES solana_blinks(id) ON DELETE CASCADE,
        channel TEXT NOT NULL,
        shared_by_user_id TEXT NULL,
        target_url TEXT NULL,
        user_agent TEXT NULL,
        ip TEXT NULL,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_blink_shares_blink_id
        ON solana_blink_shares (blink_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_blink_shares_shared_by_user_id
        ON solana_blink_shares (shared_by_user_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_blink_shares_channel
        ON solana_blink_shares (channel);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_blink_shares_created_at
        ON solana_blink_shares (created_at DESC);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS solana_blink_clicks (
        id TEXT PRIMARY KEY,
        blink_id TEXT NOT NULL REFERENCES solana_blinks(id) ON DELETE CASCADE,
        channel TEXT NULL,
        wallet TEXT NULL,
        user_agent TEXT NULL,
        ip TEXT NULL,
        request_id TEXT NULL,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_blink_clicks_blink_id
        ON solana_blink_clicks (blink_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_blink_clicks_wallet
        ON solana_blink_clicks (wallet);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_blink_clicks_created_at
        ON solana_blink_clicks (created_at DESC);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS solana_blink_conversions (
        id TEXT PRIMARY KEY,
        blink_id TEXT NOT NULL REFERENCES solana_blinks(id) ON DELETE CASCADE,
        wallet TEXT NOT NULL,
        token_symbol TEXT NOT NULL,
        token_mint TEXT NOT NULL,
        amount NUMERIC(24, 9) NOT NULL DEFAULT 0,
        signature TEXT NOT NULL,
        reference TEXT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        subscription_id TEXT NULL,
        referral_relationship_id TEXT NULL,
        provider_id TEXT NULL,
        request_id TEXT NULL,
        idempotency_key TEXT NULL,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_blink_conversions_blink_id
        ON solana_blink_conversions (blink_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_blink_conversions_wallet
        ON solana_blink_conversions (wallet);
    `);
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_solana_blink_conversions_signature
        ON solana_blink_conversions (signature);
    `);
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_solana_blink_conversions_idempotency_key
        ON solana_blink_conversions (idempotency_key)
        WHERE idempotency_key IS NOT NULL;
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_blink_conversions_status
        ON solana_blink_conversions (status);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_blink_conversions_created_at
        ON solana_blink_conversions (created_at DESC);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS solana_blink_receipts (
        id TEXT PRIMARY KEY,
        blink_id TEXT NOT NULL REFERENCES solana_blinks(id) ON DELETE CASCADE,
        conversion_id TEXT NULL REFERENCES solana_blink_conversions(id) ON DELETE SET NULL,
        wallet TEXT NOT NULL,
        signature TEXT NOT NULL,
        reference TEXT NULL,
        block_slot BIGINT NULL,
        block_time BIGINT NULL,
        confirmation_status TEXT NULL,
        raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_solana_blink_receipts_signature
        ON solana_blink_receipts (signature);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_blink_receipts_blink_id
        ON solana_blink_receipts (blink_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_blink_receipts_conversion_id
        ON solana_blink_receipts (conversion_id);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS solana_actions_confirmations (
        id TEXT PRIMARY KEY,
        blink_id TEXT NULL,
        conversion_id TEXT NULL,
        signature TEXT NOT NULL,
        reference TEXT NULL,
        wallet TEXT NOT NULL,
        amount NUMERIC(24, 9) NULL,
        token_symbol TEXT NULL,
        token_mint TEXT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        block_slot BIGINT NULL,
        block_time BIGINT NULL,
        commitment TEXT NOT NULL DEFAULT 'confirmed',
        error_message TEXT NULL,
        raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_solana_actions_confirmations_signature
        ON solana_actions_confirmations (signature);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_actions_confirmations_blink_id
        ON solana_actions_confirmations (blink_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_actions_confirmations_conversion_id
        ON solana_actions_confirmations (conversion_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_actions_confirmations_status
        ON solana_actions_confirmations (status);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_actions_confirmations_wallet
        ON solana_actions_confirmations (wallet);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_actions_confirmations_created_at
        ON solana_actions_confirmations (created_at DESC);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS solana_actions_idempotency (
        id BIGSERIAL PRIMARY KEY,
        key TEXT NOT NULL,
        signature TEXT NOT NULL,
        blink_id TEXT NULL,
        wallet TEXT NULL,
        conversion_id TEXT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_solana_actions_idempotency_key
        ON solana_actions_idempotency (key);
    `);
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_solana_actions_idempotency_signature
        ON solana_actions_idempotency (signature);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_actions_idempotency_created_at
        ON solana_actions_idempotency (created_at DESC);
    `);
  },

  async down(client) {
    await client.query('DROP TABLE IF EXISTS solana_actions_idempotency;');
    await client.query('DROP TABLE IF EXISTS solana_actions_confirmations;');
    await client.query('DROP TABLE IF EXISTS solana_blink_receipts;');
    await client.query('DROP TABLE IF EXISTS solana_blink_conversions;');
    await client.query('DROP TABLE IF EXISTS solana_blink_clicks;');
    await client.query('DROP TABLE IF EXISTS solana_blink_shares;');
    await client.query('DROP TABLE IF EXISTS solana_blink_templates;');
    await client.query('DROP TABLE IF EXISTS solana_blinks;');
  },
};