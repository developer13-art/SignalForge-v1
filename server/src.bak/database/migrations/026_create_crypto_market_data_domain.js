'use strict';

/**
 * SignalForge - Migration 026
 *
 * Creates the crypto market data domain: crypto symbols and aliases,
 * price snapshots and latest prices, liquidity snapshots and latest
 * liquidity, volume rollups, pool registry, and token metadata.
 */

module.exports = {
  name: '026_create_crypto_market_data_domain',

  async up(client) {
    await client.query(`
      CREATE TABLE IF NOT EXISTS crypto_symbols (
        id TEXT PRIMARY KEY,
        canonical_symbol TEXT NOT NULL UNIQUE,
        base_asset TEXT NOT NULL,
        quote_asset TEXT NOT NULL,
        symbol_class TEXT NOT NULL,
        is_perp BOOLEAN NOT NULL DEFAULT FALSE,
        is_swap BOOLEAN NOT NULL DEFAULT FALSE,
        is_stable_pair BOOLEAN NOT NULL DEFAULT FALSE,
        decimal_precision INT NULL,
        price_precision INT NULL,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_crypto_symbols_base_asset
        ON crypto_symbols (base_asset);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_crypto_symbols_quote_asset
        ON crypto_symbols (quote_asset);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_crypto_symbols_class
        ON crypto_symbols (symbol_class);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS crypto_symbol_aliases (
        id TEXT PRIMARY KEY,
        symbol_id TEXT NOT NULL REFERENCES crypto_symbols(id) ON DELETE CASCADE,
        alias TEXT NOT NULL,
        normalized_alias TEXT NOT NULL UNIQUE,
        source TEXT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_crypto_symbol_aliases_symbol_id
        ON crypto_symbol_aliases (symbol_id);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS crypto_price_snapshots (
        id TEXT PRIMARY KEY,
        canonical_symbol TEXT NOT NULL,
        base_asset TEXT NULL,
        quote_asset TEXT NULL,
        price NUMERIC(24, 9) NOT NULL,
        source TEXT NOT NULL,
        source_symbol TEXT NULL,
        bid NUMERIC(24, 9) NULL,
        ask NUMERIC(24, 9) NULL,
        mid NUMERIC(24, 9) NULL,
        volume_24h_usd NUMERIC(24, 4) NULL,
        liquidity_usd NUMERIC(24, 4) NULL,
        source_timestamp TIMESTAMPTZ NULL,
        fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_crypto_price_snapshots_symbol
        ON crypto_price_snapshots (canonical_symbol);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_crypto_price_snapshots_fetched_at
        ON crypto_price_snapshots (fetched_at DESC);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS crypto_price_latest (
        canonical_symbol TEXT PRIMARY KEY,
        base_asset TEXT NULL,
        quote_asset TEXT NULL,
        price NUMERIC(24, 9) NOT NULL,
        source TEXT NOT NULL,
        source_symbol TEXT NULL,
        bid NUMERIC(24, 9) NULL,
        ask NUMERIC(24, 9) NULL,
        mid NUMERIC(24, 9) NULL,
        volume_24h_usd NUMERIC(24, 4) NULL,
        liquidity_usd NUMERIC(24, 4) NULL,
        source_timestamp TIMESTAMPTZ NULL,
        fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS crypto_liquidity_snapshots (
        id TEXT PRIMARY KEY,
        pool_id TEXT NOT NULL,
        source TEXT NOT NULL,
        base_mint TEXT NULL,
        quote_mint TEXT NULL,
        canonical_symbol TEXT NULL,
        liquidity_usd NUMERIC(24, 4) NOT NULL,
        reserve_base NUMERIC(24, 9) NULL,
        reserve_quote NUMERIC(24, 9) NULL,
        fee_rate NUMERIC(10, 6) NULL,
        tier TEXT NULL,
        source_timestamp TIMESTAMPTZ NULL,
        fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_crypto_liquidity_snapshots_pool_id
        ON crypto_liquidity_snapshots (pool_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_crypto_liquidity_snapshots_symbol
        ON crypto_liquidity_snapshots (canonical_symbol);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS crypto_liquidity_latest (
        pool_id TEXT PRIMARY KEY,
        source TEXT NOT NULL,
        base_mint TEXT NULL,
        quote_mint TEXT NULL,
        canonical_symbol TEXT NULL,
        liquidity_usd NUMERIC(24, 4) NOT NULL,
        reserve_base NUMERIC(24, 9) NULL,
        reserve_quote NUMERIC(24, 9) NULL,
        fee_rate NUMERIC(10, 6) NULL,
        tier TEXT NULL,
        source_timestamp TIMESTAMPTZ NULL,
        fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_crypto_liquidity_latest_symbol
        ON crypto_liquidity_latest (canonical_symbol);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS crypto_volume_rollups (
        canonical_symbol TEXT NOT NULL,
        window TEXT NOT NULL,
        volume_quote NUMERIC(24, 4) NOT NULL,
        volume_base NUMERIC(24, 9) NULL,
        trades_count INT NOT NULL DEFAULT 0,
        window_start TIMESTAMPTZ NOT NULL,
        window_end TIMESTAMPTZ NOT NULL,
        fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        PRIMARY KEY (canonical_symbol, window)
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_crypto_volume_rollups_window
        ON crypto_volume_rollups (window);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_crypto_volume_rollups_fetched_at
        ON crypto_volume_rollups (fetched_at DESC);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS crypto_pools (
        id TEXT PRIMARY KEY,
        source TEXT NOT NULL,
        pool_type TEXT NULL,
        address TEXT NOT NULL,
        base_mint TEXT NOT NULL,
        quote_mint TEXT NOT NULL,
        base_symbol TEXT NULL,
        quote_symbol TEXT NULL,
        tick_spacing INT NULL,
        fee_rate NUMERIC(10, 6) NULL,
        lp_mint TEXT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_crypto_pools_source_address
        ON crypto_pools (source, address);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_crypto_pools_mints
        ON crypto_pools (base_mint, quote_mint);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_crypto_pools_symbols
        ON crypto_pools (base_symbol, quote_symbol);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_crypto_pools_source
        ON crypto_pools (source);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS crypto_token_metadata (
        mint TEXT PRIMARY KEY,
        symbol TEXT NULL,
        name TEXT NULL,
        decimals INT NULL,
        logo_uri TEXT NULL,
        tags JSONB NULL,
        is_verified BOOLEAN NOT NULL DEFAULT FALSE,
        source TEXT NULL,
        source_reference TEXT NULL,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_crypto_token_metadata_symbol
        ON crypto_token_metadata (symbol);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_crypto_token_metadata_source
        ON crypto_token_metadata (source);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_crypto_token_metadata_verified
        ON crypto_token_metadata (is_verified, symbol);
    `);
  },

  async down(client) {
    await client.query('DROP TABLE IF EXISTS crypto_token_metadata;');
    await client.query('DROP TABLE IF EXISTS crypto_pools;');
    await client.query('DROP TABLE IF EXISTS crypto_volume_rollups;');
    await client.query('DROP TABLE IF EXISTS crypto_liquidity_latest;');
    await client.query('DROP TABLE IF EXISTS crypto_liquidity_snapshots;');
    await client.query('DROP TABLE IF EXISTS crypto_price_latest;');
    await client.query('DROP TABLE IF EXISTS crypto_price_snapshots;');
    await client.query('DROP TABLE IF EXISTS crypto_symbol_aliases;');
    await client.query('DROP TABLE IF EXISTS crypto_symbols;');
  },
};