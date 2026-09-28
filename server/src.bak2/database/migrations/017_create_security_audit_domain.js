/**
 * Migration 017 - Security & Audit Domain
 *
 * @module server/database/migrations/017_create_security_audit_domain
 */

export async function up(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id BIGSERIAL PRIMARY KEY,
      actor_id UUID,
      actor_type VARCHAR(32),
      action VARCHAR(64) NOT NULL,
      resource_type VARCHAR(64),
      resource_id VARCHAR(128),
      severity VARCHAR(16) NOT NULL DEFAULT 'INFO',
      details JSONB,
      ip_address INET,
      user_agent TEXT,
      request_id VARCHAR(128),
      correlation_id VARCHAR(128),
      metadata JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_audit_logs_actor
      ON audit_logs (actor_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_action
      ON audit_logs (action, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_resource
      ON audit_logs (resource_type, resource_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_severity
      ON audit_logs (severity, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_correlation
      ON audit_logs (correlation_id);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(128) NOT NULL,
      key_prefix VARCHAR(32) NOT NULL UNIQUE,
      hashed_key VARCHAR(128) NOT NULL,
      permissions JSONB,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      expires_at TIMESTAMPTZ,
      last_used_at TIMESTAMPTZ,
      revoked_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_api_keys_user
      ON api_keys (user_id, active);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS security_threats (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      ip_address INET,
      user_agent TEXT,
      threat_type VARCHAR(64) NOT NULL,
      level VARCHAR(16) NOT NULL,
      details JSONB,
      resolved_at TIMESTAMPTZ,
      resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
      resolution_notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_security_threats_open
      ON security_threats (level, created_at DESC)
      WHERE resolved_at IS NULL;
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS admin_actions (
      id BIGSERIAL PRIMARY KEY,
      admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
      action VARCHAR(64) NOT NULL,
      target_type VARCHAR(64),
      target_id VARCHAR(128),
      details JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_admin_actions_admin
      ON admin_actions (admin_id, created_at DESC);
  `);
}

export async function down(client) {
  await client.query(`DROP TABLE IF EXISTS admin_actions CASCADE`);
  await client.query(`DROP TABLE IF EXISTS security_threats CASCADE`);
  await client.query(`DROP TABLE IF EXISTS api_keys CASCADE`);
  await client.query(`DROP TABLE IF EXISTS audit_logs CASCADE`);
}