/**
 * Migration 008 - Trading Domain
 *
 * @module server/database/migrations/008_create_trading_domain
 */

export async function up(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS risk_profiles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      risk_percent NUMERIC(8,4),
      max_daily_loss NUMERIC(20,8),
      max_drawdown NUMERIC(5,4),
      max_open_trades INTEGER,
      trading_sessions JSONB,
      trailing_stop_enabled BOOLEAN NOT NULL DEFAULT FALSE,
      break_even_enabled BOOLEAN NOT NULL DEFAULT FALSE,
      profit_lock_enabled BOOLEAN NOT NULL DEFAULT FALSE,
      partial_close_enabled BOOLEAN NOT NULL DEFAULT FALSE,
      correlation_protection_enabled BOOLEAN NOT NULL DEFAULT FALSE,
      news_filter_enabled BOOLEAN NOT NULL DEFAULT FALSE,
      emergency_stop_enabled BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS automation_rules (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(128) NOT NULL,
      description TEXT,
      scope VARCHAR(32) NOT NULL DEFAULT 'GLOBAL',
      provider_id UUID,
      symbol VARCHAR(32),
      condition JSONB NOT NULL,
      action JSONB NOT NULL,
      priority INTEGER NOT NULL DEFAULT 100,
      enabled BOOLEAN NOT NULL DEFAULT TRUE,
      stop_on_match BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_automation_rules_user
      ON automation_rules (user_id)
      WHERE enabled = TRUE;
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS trades (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      broker_account_id UUID NOT NULL REFERENCES broker_accounts(id) ON DELETE CASCADE,
      signal_id UUID REFERENCES signals(id) ON DELETE SET NULL,
      provider_id UUID,
      parent_trade_id UUID REFERENCES trades(id) ON DELETE SET NULL,
      symbol VARCHAR(32) NOT NULL,
      direction VARCHAR(8) NOT NULL,
      entry_type VARCHAR(16) NOT NULL DEFAULT 'MARKET',
      requested_price NUMERIC(20,8),
      entry_price NUMERIC(20,8),
      exit_price NUMERIC(20,8),
      volume NUMERIC(20,8) NOT NULL,
      remaining_volume NUMERIC(20,8),
      stop_loss NUMERIC(20,8),
      take_profit NUMERIC(20,8),
      magic_number INTEGER,
      broker_order_id VARCHAR(64),
      broker_position_id VARCHAR(64),
      broker_ticket VARCHAR(64),
      platform VARCHAR(16),
      account_type VARCHAR(16),
      status VARCHAR(32) NOT NULL DEFAULT 'SIGNAL_RECEIVED',
      realized_profit NUMERIC(20,8),
      unrealized_profit NUMERIC(20,8),
      commission NUMERIC(20,8),
      swap NUMERIC(20,8),
      opened_at TIMESTAMPTZ,
      closed_at TIMESTAMPTZ,
      opened_by VARCHAR(32),
      closed_by VARCHAR(32),
      closure_reason VARCHAR(128),
      rejection_reason TEXT,
      metadata JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_trades_user ON trades (user_id);
    CREATE INDEX IF NOT EXISTS idx_trades_account ON trades (broker_account_id);
    CREATE INDEX IF NOT EXISTS idx_trades_signal ON trades (signal_id);
    CREATE INDEX IF NOT EXISTS idx_trades_status ON trades (status);
    CREATE INDEX IF NOT EXISTS idx_trades_opened ON trades (opened_at DESC);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS trade_events (
      id BIGSERIAL PRIMARY KEY,
      trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
      event_type VARCHAR(64) NOT NULL,
      actor_type VARCHAR(32),
      actor_id UUID,
      details JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_trade_events_trade_time
      ON trade_events (trade_id, created_at ASC);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS trade_shadows (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
      provider_trade_id UUID REFERENCES trades(id) ON DELETE SET NULL,
      user_exit_price NUMERIC(20,8),
      provider_exit_price NUMERIC(20,8),
      missed_profit NUMERIC(20,8),
      better_exit_amount NUMERIC(20,8),
      behavior_notes TEXT,
      metadata JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS risk_decisions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      signal_id UUID NOT NULL REFERENCES signals(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      broker_account_id UUID REFERENCES broker_accounts(id) ON DELETE SET NULL,
      decision VARCHAR(32) NOT NULL,
      approved_volume NUMERIC(20,8),
      approved_risk_percent NUMERIC(8,4),
      checks JSONB,
      failed_checks JSONB,
      reason TEXT,
      duration_ms INTEGER,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_risk_decisions_signal
      ON risk_decisions (signal_id);
    CREATE INDEX IF NOT EXISTS idx_risk_decisions_user
      ON risk_decisions (user_id, created_at DESC);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS execution_logs (
      id BIGSERIAL PRIMARY KEY,
      trade_id UUID REFERENCES trades(id) ON DELETE CASCADE,
      execution_request_id UUID,
      attempt INTEGER NOT NULL DEFAULT 1,
      status VARCHAR(32) NOT NULL,
      broker_response JSONB,
      error TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_execution_logs_trade
      ON execution_logs (trade_id, created_at ASC);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS execution_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
      signal_id UUID REFERENCES signals(id) ON DELETE SET NULL,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      broker_account_id UUID NOT NULL REFERENCES broker_accounts(id) ON DELETE CASCADE,
      symbol VARCHAR(32) NOT NULL,
      direction VARCHAR(8) NOT NULL,
      entry_type VARCHAR(16) NOT NULL,
      volume NUMERIC(20,8) NOT NULL,
      price NUMERIC(20,8),
      stop_loss NUMERIC(20,8),
      take_profit NUMERIC(20,8),
      status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
      attempts INTEGER NOT NULL DEFAULT 0,
      max_attempts INTEGER NOT NULL DEFAULT 3,
      requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      completed_at TIMESTAMPTZ,
      error TEXT,
      metadata JSONB
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_execution_requests_status
      ON execution_requests (status);
    CREATE INDEX IF NOT EXISTS idx_execution_requests_trade
      ON execution_requests (trade_id);
  `);
}

export async function down(client) {
  await client.query(`DROP TABLE IF EXISTS execution_requests CASCADE`);
  await client.query(`DROP TABLE IF EXISTS execution_logs CASCADE`);
  await client.query(`DROP TABLE IF EXISTS risk_decisions CASCADE`);
  await client.query(`DROP TABLE IF EXISTS trade_shadows CASCADE`);
  await client.query(`DROP TABLE IF EXISTS trade_events CASCADE`);
  await client.query(`DROP TABLE IF EXISTS trades CASCADE`);
  await client.query(`DROP TABLE IF EXISTS automation_rules CASCADE`);
  await client.query(`DROP TABLE IF EXISTS risk_profiles CASCADE`);
}