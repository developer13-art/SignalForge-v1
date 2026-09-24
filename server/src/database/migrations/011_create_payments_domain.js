/**
 * Migration 011 - Payments Domain
 *
 * @module server/database/migrations/011_create_payments_domain
 */

export async function up(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS subscription_plans (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      code VARCHAR(64) NOT NULL UNIQUE,
      name VARCHAR(128) NOT NULL,
      description TEXT,
      price NUMERIC(20,8) NOT NULL,
      currency VARCHAR(8) NOT NULL DEFAULT 'USD',
      billing_interval VARCHAR(32) NOT NULL,
      features JSONB,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      plan_code VARCHAR(64) NOT NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'TRIAL',
      trial_ends_at TIMESTAMPTZ,
      current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      current_period_end TIMESTAMPTZ,
      cancelled_at TIMESTAMPTZ,
      cancelled_reason TEXT,
      wl_project_id UUID,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status
      ON subscriptions (user_id, status);
    CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end
      ON subscriptions (current_period_end)
      WHERE status IN ('ACTIVE', 'TRIAL', 'PAST_DUE', 'GRACE_PERIOD');
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS payments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
      amount NUMERIC(20,8) NOT NULL,
      currency VARCHAR(8) NOT NULL DEFAULT 'USD',
      provider VARCHAR(32) NOT NULL,
      provider_reference VARCHAR(128),
      method VARCHAR(64),
      status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
      processing_fee NUMERIC(20,8),
      refunded_amount NUMERIC(20,8),
      refund_reason TEXT,
      refunded_by UUID REFERENCES users(id) ON DELETE SET NULL,
      refunded_at TIMESTAMPTZ,
      confirmed_at TIMESTAMPTZ,
      failure_reason TEXT,
      metadata JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_payments_user_time
      ON payments (user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_payments_status
      ON payments (status);
    CREATE INDEX IF NOT EXISTS idx_payments_provider_reference
      ON payments (provider, provider_reference);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS payment_events (
      id BIGSERIAL PRIMARY KEY,
      payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
      event_type VARCHAR(64) NOT NULL,
      payload JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_payment_events_payment
      ON payment_events (payment_id, created_at ASC);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS invoices (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
      invoice_number VARCHAR(64) NOT NULL UNIQUE,
      amount NUMERIC(20,8) NOT NULL,
      currency VARCHAR(8) NOT NULL DEFAULT 'USD',
      status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
      issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      paid_at TIMESTAMPTZ,
      pdf_storage_key TEXT,
      metadata JSONB
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_invoices_user
      ON invoices (user_id, issued_at DESC);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS wallet_ledger (
      id BIGSERIAL PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      entry_type VARCHAR(64) NOT NULL,
      amount NUMERIC(20,8) NOT NULL,
      currency VARCHAR(8) NOT NULL DEFAULT 'USD',
      balance_before NUMERIC(20,8),
      balance_after NUMERIC(20,8),
      reference_type VARCHAR(64),
      reference_id UUID,
      description TEXT,
      related_entry_id UUID,
      is_reversal BOOLEAN NOT NULL DEFAULT FALSE,
      reversal_of_entry_id UUID,
      actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
      actor_type VARCHAR(32),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_wallet_ledger_user_time
      ON wallet_ledger (user_id, created_at DESC);
  `);
}

export async function down(client) {
  await client.query(`DROP TABLE IF EXISTS wallet_ledger CASCADE`);
  await client.query(`DROP TABLE IF EXISTS invoices CASCADE`);
  await client.query(`DROP TABLE IF EXISTS payment_events CASCADE`);
  await client.query(`DROP TABLE IF EXISTS payments CASCADE`);
  await client.query(`DROP TABLE IF EXISTS subscriptions CASCADE`);
  await client.query(`DROP TABLE IF EXISTS subscription_plans CASCADE`);
}