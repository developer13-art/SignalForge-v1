/**
 * Migration 009 - Performance Domain
 *
 * @module server/database/migrations/009_create_performance_domain
 */

export async function up(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS performance_periods (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      period VARCHAR(7) NOT NULL,
      opening_balance NUMERIC(20,8),
      closing_balance NUMERIC(20,8),
      gross_profit NUMERIC(20,8) DEFAULT 0,
      gross_loss NUMERIC(20,8) DEFAULT 0,
      trading_costs NUMERIC(20,8) DEFAULT 0,
      eligible_net_profit NUMERIC(20,8) DEFAULT 0,
      status VARCHAR(32) NOT NULL DEFAULT 'OPEN',
      closed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (user_id, period)
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_performance_periods_user_period
      ON performance_periods (user_id, period DESC);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS performance_metrics (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      period VARCHAR(7),
      total_trades INTEGER DEFAULT 0,
      winners INTEGER DEFAULT 0,
      losers INTEGER DEFAULT 0,
      win_rate NUMERIC(5,4),
      net_profit NUMERIC(20,8),
      average_win NUMERIC(20,8),
      average_loss NUMERIC(20,8),
      profit_factor NUMERIC(10,4),
      max_drawdown NUMERIC(20,8),
      sharpe_ratio NUMERIC(10,4),
      sortino_ratio NUMERIC(10,4),
      average_rr NUMERIC(10,4),
      computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_period
      ON performance_metrics (user_id, period DESC);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS equity_snapshots (
      id BIGSERIAL PRIMARY KEY,
      broker_account_id UUID NOT NULL REFERENCES broker_accounts(id) ON DELETE CASCADE,
      equity NUMERIC(20,8) NOT NULL,
      balance NUMERIC(20,8) NOT NULL,
      captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_equity_snapshots_account_time
      ON equity_snapshots (broker_account_id, captured_at ASC);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS trade_analytics_daily (
      id BIGSERIAL PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      day DATE NOT NULL,
      trades INTEGER DEFAULT 0,
      net_profit NUMERIC(20,8) DEFAULT 0,
      winners INTEGER DEFAULT 0,
      losers INTEGER DEFAULT 0,
      UNIQUE (user_id, day)
    );
  `);
}

export async function down(client) {
  await client.query(`DROP TABLE IF EXISTS trade_analytics_daily CASCADE`);
  await client.query(`DROP TABLE IF EXISTS equity_snapshots CASCADE`);
  await client.query(`DROP TABLE IF EXISTS performance_metrics CASCADE`);
  await client.query(`DROP TABLE IF EXISTS performance_periods CASCADE`);
}