'use strict';

/**
 * SignalForge - Migration 025
 *
 * Creates the hybrid execution domain: routing policies, routes,
 * route logs, instruments, and per-gateway order and swap tables for
 * Jupiter, Raydium, Orca, Hyperliquid, and Drift.
 *
 * All tables are additive; no existing table is altered.
 */

module.exports = {
  name: '025_create_hybrid_execution_domain',

  async up(client) {
    await client.query(`
      CREATE TABLE IF NOT EXISTS execution_route_policies (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL DEFAULT 'default',
        mode TEXT NOT NULL,
        fallback_behavior TEXT NOT NULL DEFAULT 'retry_next',
        preferred_gateway TEXT NULL,
        preferred_instrument_class TEXT NULL,
        allowed_gateways JSONB NULL,
        blocked_gateways JSONB NULL,
        max_slippage_bps INT NULL,
        priority_fees_micro_lamports BIGINT NULL,
        is_default BOOLEAN NOT NULL DEFAULT FALSE,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_execution_route_policies_user_id
        ON execution_route_policies (user_id);
    `);
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_execution_route_policies_default
        ON execution_route_policies (user_id)
        WHERE is_default = TRUE;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS execution_routes (
        id TEXT PRIMARY KEY,
        user_id TEXT NULL,
        provider_id TEXT NULL,
        account_id TEXT NULL,
        signal_id TEXT NULL,
        trade_id TEXT NULL,
        symbol TEXT NOT NULL,
        instrument_class TEXT NULL,
        order_type TEXT NULL,
        direction TEXT NULL,
        resolved_gateway TEXT NOT NULL,
        fallback_gateway TEXT NULL,
        status TEXT NOT NULL DEFAULT 'resolved',
        reason TEXT NULL,
        policy_id TEXT NULL,
        policy_mode TEXT NULL,
        request_id TEXT NULL,
        attempt INT NOT NULL DEFAULT 1,
        latency_ms INT NULL,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_execution_routes_user_id
        ON execution_routes (user_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_execution_routes_symbol
        ON execution_routes (symbol);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_execution_routes_gateway
        ON execution_routes (resolved_gateway);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_execution_routes_status
        ON execution_routes (status);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_execution_routes_created_at
        ON execution_routes (created_at DESC);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS execution_route_logs (
        id TEXT PRIMARY KEY,
        route_id TEXT NULL REFERENCES execution_routes(id) ON DELETE SET NULL,
        action TEXT NOT NULL,
        message TEXT NULL,
        payload JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_execution_route_logs_route_id
        ON execution_route_logs (route_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_execution_route_logs_created_at
        ON execution_route_logs (created_at DESC);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS execution_instruments (
        id TEXT PRIMARY KEY,
        symbol TEXT NOT NULL,
        instrument_class TEXT NOT NULL,
        gateway TEXT NOT NULL,
        is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
        min_amount NUMERIC(24, 9) NULL,
        max_amount NUMERIC(24, 9) NULL,
        price_precision INT NULL,
        quantity_precision INT NULL,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_execution_instruments_symbol_gateway
        ON execution_instruments (symbol, gateway);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_execution_instruments_class
        ON execution_instruments (instrument_class);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_execution_instruments_gateway
        ON execution_instruments (gateway);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS solana_dex_quotes (
        id TEXT PRIMARY KEY,
        user_id TEXT NULL,
        account_id TEXT NULL,
        gateway TEXT NOT NULL,
        input_mint TEXT NOT NULL,
        output_mint TEXT NOT NULL,
        input_symbol TEXT NULL,
        output_symbol TEXT NULL,
        in_amount NUMERIC(24, 9) NOT NULL,
        out_amount NUMERIC(24, 9) NOT NULL,
        other_amount_threshold NUMERIC(24, 9) NULL,
        min_out_amount NUMERIC(24, 9) NULL,
        slippage_bps INT NOT NULL,
        swap_mode TEXT NULL,
        price_impact_pct NUMERIC(10, 4) NULL,
        route_plan JSONB NOT NULL DEFAULT '[]'::jsonb,
        pool_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
        raw_quote JSONB NOT NULL DEFAULT '{}'::jsonb,
        expires_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_dex_quotes_user_id
        ON solana_dex_quotes (user_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_dex_quotes_gateway
        ON solana_dex_quotes (gateway);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_dex_quotes_pair
        ON solana_dex_quotes (input_mint, output_mint);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_dex_quotes_created_at
        ON solana_dex_quotes (created_at DESC);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS solana_dex_swaps (
        id TEXT PRIMARY KEY,
        quote_id TEXT NULL,
        user_id TEXT NULL,
        account_id TEXT NULL,
        gateway TEXT NOT NULL,
        input_mint TEXT NOT NULL,
        output_mint TEXT NOT NULL,
        in_amount NUMERIC(24, 9) NOT NULL,
        out_amount NUMERIC(24, 9) NOT NULL,
        slippage_bps INT NOT NULL,
        price_impact_pct NUMERIC(10, 4) NULL,
        transaction_signature TEXT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        block_slot BIGINT NULL,
        block_time BIGINT NULL,
        error_message TEXT NULL,
        raw_response JSONB NULL,
        submitted_at TIMESTAMPTZ NULL,
        confirmed_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_dex_swaps_user_id
        ON solana_dex_swaps (user_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_dex_swaps_gateway
        ON solana_dex_swaps (gateway);
    `);
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_solana_dex_swaps_signature
        ON solana_dex_swaps (transaction_signature)
        WHERE transaction_signature IS NOT NULL;
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_dex_swaps_status
        ON solana_dex_swaps (status);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_dex_swaps_created_at
        ON solana_dex_swaps (created_at DESC);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS solana_dex_routes (
        id TEXT PRIMARY KEY,
        quote_id TEXT NULL,
        gateway TEXT NOT NULL,
        amm_key TEXT NULL,
        label TEXT NULL,
        input_mint TEXT NULL,
        output_mint TEXT NULL,
        in_amount NUMERIC(24, 9) NULL,
        out_amount NUMERIC(24, 9) NULL,
        fee_amount NUMERIC(24, 9) NULL,
        fee_mint TEXT NULL,
        percent NUMERIC(10, 4) NULL,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_dex_routes_quote_id
        ON solana_dex_routes (quote_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solana_dex_routes_gateway
        ON solana_dex_routes (gateway);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS raydium_pools (
        id TEXT PRIMARY KEY,
        pool_type TEXT NOT NULL DEFAULT 'amm_v4',
        base_mint TEXT NOT NULL,
        quote_mint TEXT NOT NULL,
        base_symbol TEXT NULL,
        quote_symbol TEXT NULL,
        amm_id TEXT NULL,
        lp_mint TEXT NULL,
        price NUMERIC(24, 9) NULL,
        liquidity_usd NUMERIC(24, 4) NULL,
        volume_24h_usd NUMERIC(24, 4) NULL,
        fee_rate NUMERIC(10, 6) NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_raydium_pools_mints
        ON raydium_pools (base_mint, quote_mint);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_raydium_pools_amm_id
        ON raydium_pools (amm_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_raydium_pools_liquidity
        ON raydium_pools (liquidity_usd DESC NULLS LAST);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS raydium_quotes (
        id TEXT PRIMARY KEY,
        user_id TEXT NULL,
        account_id TEXT NULL,
        gateway TEXT NOT NULL DEFAULT 'raydium',
        input_mint TEXT NOT NULL,
        output_mint TEXT NOT NULL,
        input_symbol TEXT NULL,
        output_symbol TEXT NULL,
        in_amount NUMERIC(24, 9) NOT NULL,
        out_amount NUMERIC(24, 9) NOT NULL,
        min_out_amount NUMERIC(24, 9) NULL,
        slippage_bps INT NOT NULL,
        price_impact_pct NUMERIC(10, 4) NULL,
        pool_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
        raw_quote JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_raydium_quotes_user_id
        ON raydium_quotes (user_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_raydium_quotes_created_at
        ON raydium_quotes (created_at DESC);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS raydium_swaps (
        id TEXT PRIMARY KEY,
        quote_id TEXT NULL,
        user_id TEXT NULL,
        account_id TEXT NULL,
        gateway TEXT NOT NULL DEFAULT 'raydium',
        input_mint TEXT NOT NULL,
        output_mint TEXT NOT NULL,
        in_amount NUMERIC(24, 9) NOT NULL,
        out_amount NUMERIC(24, 9) NOT NULL,
        slippage_bps INT NOT NULL,
        price_impact_pct NUMERIC(10, 4) NULL,
        transaction_signature TEXT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        block_slot BIGINT NULL,
        block_time BIGINT NULL,
        error_message TEXT NULL,
        raw_response JSONB NULL,
        submitted_at TIMESTAMPTZ NULL,
        confirmed_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_raydium_swaps_signature
        ON raydium_swaps (transaction_signature)
        WHERE transaction_signature IS NOT NULL;
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_raydium_swaps_status
        ON raydium_swaps (status);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS orca_pools (
        id TEXT PRIMARY KEY,
        pool_type TEXT NOT NULL DEFAULT 'whirlpool',
        base_mint TEXT NOT NULL,
        quote_mint TEXT NOT NULL,
        base_symbol TEXT NULL,
        quote_symbol TEXT NULL,
        whirlpool_address TEXT NULL,
        tick_spacing INT NULL,
        fee_rate NUMERIC(10, 6) NULL,
        price NUMERIC(24, 9) NULL,
        liquidity_usd NUMERIC(24, 4) NULL,
        volume_24h_usd NUMERIC(24, 4) NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_orca_pools_mints
        ON orca_pools (base_mint, quote_mint);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_orca_pools_whirlpool
        ON orca_pools (whirlpool_address);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS orca_quotes (
        id TEXT PRIMARY KEY,
        user_id TEXT NULL,
        account_id TEXT NULL,
        gateway TEXT NOT NULL DEFAULT 'orca',
        input_mint TEXT NOT NULL,
        output_mint TEXT NOT NULL,
        input_symbol TEXT NULL,
        output_symbol TEXT NULL,
        in_amount NUMERIC(24, 9) NOT NULL,
        out_amount NUMERIC(24, 9) NOT NULL,
        min_out_amount NUMERIC(24, 9) NULL,
        slippage_bps INT NOT NULL,
        price_impact_pct NUMERIC(10, 4) NULL,
        whirlpool_address TEXT NULL,
        raw_quote JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_orca_quotes_user_id
        ON orca_quotes (user_id);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS orca_swaps (
        id TEXT PRIMARY KEY,
        quote_id TEXT NULL,
        user_id TEXT NULL,
        account_id TEXT NULL,
        gateway TEXT NOT NULL DEFAULT 'orca',
        input_mint TEXT NOT NULL,
        output_mint TEXT NOT NULL,
        in_amount NUMERIC(24, 9) NOT NULL,
        out_amount NUMERIC(24, 9) NOT NULL,
        slippage_bps INT NOT NULL,
        price_impact_pct NUMERIC(10, 4) NULL,
        transaction_signature TEXT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        block_slot BIGINT NULL,
        block_time BIGINT NULL,
        error_message TEXT NULL,
        raw_response JSONB NULL,
        submitted_at TIMESTAMPTZ NULL,
        confirmed_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_orca_swaps_signature
        ON orca_swaps (transaction_signature)
        WHERE transaction_signature IS NOT NULL;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS hyperliquid_markets (
        symbol TEXT PRIMARY KEY,
        name TEXT NULL,
        sz_decimals INT NULL,
        max_leverage INT NULL,
        only_isolated BOOLEAN NOT NULL DEFAULT FALSE,
        is_delisted BOOLEAN NOT NULL DEFAULT FALSE,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS hyperliquid_orders (
        id TEXT PRIMARY KEY,
        user_id TEXT NULL,
        account_id TEXT NULL,
        cloid TEXT NULL,
        symbol TEXT NOT NULL,
        side TEXT NOT NULL,
        order_type TEXT NOT NULL,
        tif TEXT NOT NULL DEFAULT 'Ioc',
        size NUMERIC(24, 9) NOT NULL,
        price NUMERIC(24, 9) NULL,
        trigger_price NUMERIC(24, 9) NULL,
        reduce_only BOOLEAN NOT NULL DEFAULT FALSE,
        leverage INT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        exchange_response JSONB NULL,
        error_message TEXT NULL,
        submitted_at TIMESTAMPTZ NULL,
        confirmed_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_hyperliquid_orders_user_id
        ON hyperliquid_orders (user_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_hyperliquid_orders_symbol
        ON hyperliquid_orders (symbol);
    `);
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_hyperliquid_orders_cloid
        ON hyperliquid_orders (cloid)
        WHERE cloid IS NOT NULL;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS hyperliquid_fills (
        id TEXT PRIMARY KEY,
        order_id TEXT NULL,
        user_id TEXT NULL,
        symbol TEXT NOT NULL,
        side TEXT NOT NULL,
        price NUMERIC(24, 9) NOT NULL,
        size NUMERIC(24, 9) NOT NULL,
        fee NUMERIC(24, 9) NULL,
        fee_token TEXT NULL,
        closed_pnl NUMERIC(24, 9) NULL,
        is_liquidation BOOLEAN NOT NULL DEFAULT FALSE,
        direction TEXT NULL,
        trade_id TEXT NULL,
        crossed BOOLEAN NOT NULL DEFAULT FALSE,
        fill_time TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_hyperliquid_fills_user_id
        ON hyperliquid_fills (user_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_hyperliquid_fills_symbol
        ON hyperliquid_fills (symbol);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_hyperliquid_fills_fill_time
        ON hyperliquid_fills (fill_time DESC NULLS LAST);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS hyperliquid_positions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        symbol TEXT NOT NULL,
        side TEXT NOT NULL,
        size NUMERIC(24, 9) NOT NULL,
        entry_price NUMERIC(24, 9) NOT NULL,
        mark_price NUMERIC(24, 9) NULL,
        liquidation_price NUMERIC(24, 9) NULL,
        leverage NUMERIC(10, 4) NULL,
        margin_used NUMERIC(24, 9) NULL,
        unrealized_pnl NUMERIC(24, 9) NULL,
        realized_pnl NUMERIC(24, 9) NULL,
        status TEXT NOT NULL DEFAULT 'open',
        opened_at TIMESTAMPTZ NULL,
        closed_at TIMESTAMPTZ NULL,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_hyperliquid_positions_user_id
        ON hyperliquid_positions (user_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_hyperliquid_positions_status
        ON hyperliquid_positions (status);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS drift_markets (
        symbol TEXT PRIMARY KEY,
        market_index INT NULL,
        market_type TEXT NOT NULL DEFAULT 'perp',
        base_asset_symbol TEXT NULL,
        quote_asset_symbol TEXT NULL,
        tick_size NUMERIC(24, 9) NULL,
        step_size NUMERIC(24, 9) NULL,
        min_order_size NUMERIC(24, 9) NULL,
        max_leverage NUMERIC(10, 4) NULL,
        initial_margin_ratio NUMERIC(10, 4) NULL,
        maintenance_margin_ratio NUMERIC(10, 4) NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS drift_orders (
        id TEXT PRIMARY KEY,
        user_id TEXT NULL,
        account_id TEXT NULL,
        symbol TEXT NOT NULL,
        market_index INT NULL,
        side TEXT NOT NULL,
        order_type TEXT NOT NULL,
        tif TEXT NOT NULL DEFAULT 'ioc',
        size NUMERIC(24, 9) NOT NULL,
        price NUMERIC(24, 9) NULL,
        trigger_price NUMERIC(24, 9) NULL,
        reduce_only BOOLEAN NOT NULL DEFAULT FALSE,
        leverage INT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        exchange_response JSONB NULL,
        error_message TEXT NULL,
        submitted_at TIMESTAMPTZ NULL,
        confirmed_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_drift_orders_user_id
        ON drift_orders (user_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_drift_orders_symbol
        ON drift_orders (symbol);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS drift_fills (
        id TEXT PRIMARY KEY,
        order_id TEXT NULL,
        user_id TEXT NULL,
        symbol TEXT NOT NULL,
        side TEXT NOT NULL,
        price NUMERIC(24, 9) NOT NULL,
        size NUMERIC(24, 9) NOT NULL,
        fee NUMERIC(24, 9) NULL,
        closed_pnl NUMERIC(24, 9) NULL,
        is_liquidation BOOLEAN NOT NULL DEFAULT FALSE,
        direction TEXT NULL,
        fill_time TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS drift_positions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        symbol TEXT NOT NULL,
        side TEXT NOT NULL,
        size NUMERIC(24, 9) NOT NULL,
        entry_price NUMERIC(24, 9) NOT NULL,
        mark_price NUMERIC(24, 9) NULL,
        liquidation_price NUMERIC(24, 9) NULL,
        leverage NUMERIC(10, 4) NULL,
        margin_used NUMERIC(24, 9) NULL,
        unrealized_pnl NUMERIC(24, 9) NULL,
        realized_pnl NUMERIC(24, 9) NULL,
        status TEXT NOT NULL DEFAULT 'open',
        opened_at TIMESTAMPTZ NULL,
        closed_at TIMESTAMPTZ NULL,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_drift_positions_user_id
        ON drift_positions (user_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_drift_positions_status
        ON drift_positions (status);
    `);
  },

  async down(client) {
    await client.query('DROP TABLE IF EXISTS drift_positions;');
    await client.query('DROP TABLE IF EXISTS drift_fills;');
    await client.query('DROP TABLE IF EXISTS drift_orders;');
    await client.query('DROP TABLE IF EXISTS drift_markets;');
    await client.query('DROP TABLE IF EXISTS hyperliquid_positions;');
    await client.query('DROP TABLE IF EXISTS hyperliquid_fills;');
    await client.query('DROP TABLE IF EXISTS hyperliquid_orders;');
    await client.query('DROP TABLE IF EXISTS hyperliquid_markets;');
    await client.query('DROP TABLE IF EXISTS orca_swaps;');
    await client.query('DROP TABLE IF EXISTS orca_quotes;');
    await client.query('DROP TABLE IF EXISTS orca_pools;');
    await client.query('DROP TABLE IF EXISTS raydium_swaps;');
    await client.query('DROP TABLE IF EXISTS raydium_quotes;');
    await client.query('DROP TABLE IF EXISTS raydium_pools;');
    await client.query('DROP TABLE IF EXISTS solana_dex_routes;');
    await client.query('DROP TABLE IF EXISTS solana_dex_swaps;');
    await client.query('DROP TABLE IF EXISTS solana_dex_quotes;');
    await client.query('DROP TABLE IF EXISTS execution_instruments;');
    await client.query('DROP TABLE IF EXISTS execution_route_logs;');
    await client.query('DROP TABLE IF EXISTS execution_routes;');
    await client.query('DROP TABLE IF EXISTS execution_route_policies;');
  },
};