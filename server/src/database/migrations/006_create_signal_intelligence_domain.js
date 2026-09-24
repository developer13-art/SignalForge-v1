/**
 * Migration 006 - Signal Intelligence Domain
 *
 * @module server/database/migrations/006_create_signal_intelligence_domain
 */

export async function up(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS signals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      provider_id UUID,
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      raw_message_id UUID REFERENCES source_messages(id) ON DELETE SET NULL,
      symbol VARCHAR(32) NOT NULL,
      normalized_symbol VARCHAR(32),
      direction VARCHAR(8) NOT NULL,
      entry_type VARCHAR(16) NOT NULL DEFAULT 'MARKET',
      entry_price NUMERIC(20,8),
      stop_loss NUMERIC(20,8),
      take_profits JSONB,
      risk_percent NUMERIC(8,4),
      lot_size NUMERIC(20,8),
      timeframe VARCHAR(16),
      classification VARCHAR(32) NOT NULL DEFAULT 'NEW_TRADE',
      confidence NUMERIC(5,4),
      parser_type VARCHAR(32),
      parser_version VARCHAR(32),
      ai_model VARCHAR(64),
      dna_version VARCHAR(32),
      language VARCHAR(8),
      original_text TEXT,
      context JSONB,
      status VARCHAR(32) NOT NULL DEFAULT 'RECEIVED',
      rejection_reason TEXT,
      fingerprint VARCHAR(64),
      expires_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_signals_provider ON signals (provider_id);
    CREATE INDEX IF NOT EXISTS idx_signals_symbol ON signals (symbol);
    CREATE INDEX IF NOT EXISTS idx_signals_status ON signals (status);
    CREATE INDEX IF NOT EXISTS idx_signals_created ON signals (created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_signals_fingerprint ON signals (fingerprint);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS signal_parses (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      signal_id UUID NOT NULL REFERENCES signals(id) ON DELETE CASCADE,
      parser_type VARCHAR(32) NOT NULL,
      parser_version VARCHAR(32),
      model VARCHAR(64),
      input_text TEXT,
      output JSONB,
      confidence NUMERIC(5,4),
      duration_ms INTEGER,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_signal_parses_signal
      ON signal_parses (signal_id);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS signal_events (
      id BIGSERIAL PRIMARY KEY,
      signal_id UUID NOT NULL REFERENCES signals(id) ON DELETE CASCADE,
      event_type VARCHAR(64) NOT NULL,
      actor_type VARCHAR(32),
      actor_id UUID,
      details JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_signal_events_signal_time
      ON signal_events (signal_id, created_at ASC);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS signal_fingerprints (
      id BIGSERIAL PRIMARY KEY,
      fingerprint VARCHAR(64) NOT NULL,
      signal_id UUID NOT NULL REFERENCES signals(id) ON DELETE CASCADE,
      provider_id UUID,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (fingerprint, signal_id)
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_signal_fingerprints_hash
      ON signal_fingerprints (fingerprint);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS signal_consensus (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      symbol VARCHAR(32) NOT NULL,
      direction VARCHAR(8) NOT NULL,
      agreement_count INTEGER NOT NULL DEFAULT 0,
      disagreement_count INTEGER NOT NULL DEFAULT 0,
      confidence NUMERIC(5,4),
      final_decision VARCHAR(16),
      window_start TIMESTAMPTZ,
      window_end TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS signal_consensus_members (
      id BIGSERIAL PRIMARY KEY,
      consensus_id UUID NOT NULL REFERENCES signal_consensus(id) ON DELETE CASCADE,
      signal_id UUID NOT NULL REFERENCES signals(id) ON DELETE CASCADE,
      provider_id UUID,
      direction VARCHAR(8) NOT NULL,
      confidence NUMERIC(5,4),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS provider_dna (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      provider_id UUID NOT NULL,
      language VARCHAR(8),
      symbol_profile JSONB,
      abbreviation_profile JSONB,
      risk_profile JSONB,
      management_profile JSONB,
      reliability_profile JSONB,
      confidence NUMERIC(5,4),
      version INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_provider_dna_provider
      ON provider_dna (provider_id);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS provider_dna_rules (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      provider_id UUID NOT NULL,
      dna_version_id UUID REFERENCES provider_dna(id) ON DELETE SET NULL,
      rule_type VARCHAR(64) NOT NULL,
      match_type VARCHAR(32) NOT NULL DEFAULT 'CONTAINS',
      pattern VARCHAR(512) NOT NULL,
      case_sensitive BOOLEAN NOT NULL DEFAULT FALSE,
      priority INTEGER NOT NULL DEFAULT 100,
      action JSONB NOT NULL,
      confidence NUMERIC(5,4),
      usage_count INTEGER NOT NULL DEFAULT 0,
      success_count INTEGER NOT NULL DEFAULT 0,
      last_used_at TIMESTAMPTZ,
      enabled BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_provider_dna_rules_provider
      ON provider_dna_rules (provider_id);
    CREATE INDEX IF NOT EXISTS idx_provider_dna_rules_enabled
      ON provider_dna_rules (provider_id, rule_type)
      WHERE enabled = TRUE;
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS provider_dna_feedback (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      provider_id UUID NOT NULL,
      signal_id UUID REFERENCES signals(id) ON DELETE SET NULL,
      message_id UUID REFERENCES source_messages(id) ON DELETE SET NULL,
      feedback_type VARCHAR(32) NOT NULL,
      details JSONB,
      actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_provider_dna_feedback_provider_time
      ON provider_dna_feedback (provider_id, created_at DESC);
  `);
}

export async function down(client) {
  await client.query(`DROP TABLE IF EXISTS provider_dna_feedback CASCADE`);
  await client.query(`DROP TABLE IF EXISTS provider_dna_rules CASCADE`);
  await client.query(`DROP TABLE IF EXISTS provider_dna CASCADE`);
  await client.query(`DROP TABLE IF EXISTS signal_consensus_members CASCADE`);
  await client.query(`DROP TABLE IF EXISTS signal_consensus CASCADE`);
  await client.query(`DROP TABLE IF EXISTS signal_fingerprints CASCADE`);
  await client.query(`DROP TABLE IF EXISTS signal_events CASCADE`);
  await client.query(`DROP TABLE IF EXISTS signal_parses CASCADE`);
  await client.query(`DROP TABLE IF EXISTS signals CASCADE`);
}