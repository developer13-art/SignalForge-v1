/**
 * Migration 003 - KYC Domain
 *
 * @module server/database/migrations/003_create_kyc_domain
 */

export async function up(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS kyc_document_types (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      code VARCHAR(64) NOT NULL UNIQUE,
      label VARCHAR(128) NOT NULL,
      description TEXT,
      required_fields JSONB,
      accepted_formats JSONB,
      max_size_bytes BIGINT,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS kyc_applications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
      provider VARCHAR(64),
      provider_reference VARCHAR(128),
      document_type VARCHAR(64),
      risk_score NUMERIC(5,2),
      reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
      rejection_reason TEXT,
      review_notes TEXT,
      resubmission_requested_at TIMESTAMPTZ,
      resubmission_issues JSONB,
      escalated_at TIMESTAMPTZ,
      escalation_reason TEXT,
      sla_due_at TIMESTAMPTZ,
      submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      reviewed_at TIMESTAMPTZ,
      verified_at TIMESTAMPTZ,
      expires_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_kyc_applications_user ON kyc_applications (user_id);
    CREATE INDEX IF NOT EXISTS idx_kyc_applications_status ON kyc_applications (status);
    CREATE INDEX IF NOT EXISTS idx_kyc_applications_reviewer
      ON kyc_applications (reviewer_id)
      WHERE reviewer_id IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_kyc_applications_sla
      ON kyc_applications (sla_due_at)
      WHERE status IN ('PENDING', 'UNDER_REVIEW');
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS kyc_documents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      application_id UUID NOT NULL REFERENCES kyc_applications(id) ON DELETE CASCADE,
      document_type VARCHAR(64) NOT NULL,
      storage_key TEXT NOT NULL,
      mime_type VARCHAR(128),
      size_bytes BIGINT,
      document_number_encrypted TEXT,
      metadata JSONB,
      uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_kyc_documents_application ON kyc_documents (application_id);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS kyc_verifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      application_id UUID NOT NULL REFERENCES kyc_applications(id) ON DELETE CASCADE,
      document_check BOOLEAN,
      identity_check BOOLEAN,
      liveness_check BOOLEAN,
      name_match BOOLEAN,
      dob_match BOOLEAN,
      risk_score NUMERIC(5,2),
      result VARCHAR(32),
      provider_response JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS kyc_audit_logs (
      id BIGSERIAL PRIMARY KEY,
      actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
      action VARCHAR(64) NOT NULL,
      resource_type VARCHAR(64),
      resource_id UUID,
      old_value JSONB,
      new_value JSONB,
      reason TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_kyc_audit_logs_resource
      ON kyc_audit_logs (resource_type, resource_id);
    CREATE INDEX IF NOT EXISTS idx_kyc_audit_logs_created
      ON kyc_audit_logs (created_at DESC);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS kyc_risk_flags (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      application_id UUID NOT NULL REFERENCES kyc_applications(id) ON DELETE CASCADE,
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      flag_type VARCHAR(64) NOT NULL,
      severity VARCHAR(16) NOT NULL,
      details JSONB,
      created_by UUID REFERENCES users(id) ON DELETE SET NULL,
      resolved_at TIMESTAMPTZ,
      resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
      resolution_notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_kyc_risk_flags_open
      ON kyc_risk_flags (severity, created_at DESC)
      WHERE resolved_at IS NULL;
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS verification_providers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      code VARCHAR(64) NOT NULL UNIQUE,
      label VARCHAR(128) NOT NULL,
      type VARCHAR(32) NOT NULL,
      config JSONB,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      priority INTEGER NOT NULL DEFAULT 100,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS compliance_audit_log (
      id BIGSERIAL PRIMARY KEY,
      actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
      action VARCHAR(64) NOT NULL,
      resource_type VARCHAR(64),
      resource_id UUID,
      previous_state JSONB,
      new_state JSONB,
      reason TEXT,
      ip_address INET,
      user_agent TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_compliance_audit_resource
      ON compliance_audit_log (resource_type, resource_id);
    CREATE INDEX IF NOT EXISTS idx_compliance_audit_created
      ON compliance_audit_log (created_at DESC);
  `);
}

export async function down(client) {
  await client.query(`DROP TABLE IF EXISTS compliance_audit_log CASCADE`);
  await client.query(`DROP TABLE IF EXISTS verification_providers CASCADE`);
  await client.query(`DROP TABLE IF EXISTS kyc_risk_flags CASCADE`);
  await client.query(`DROP TABLE IF EXISTS kyc_audit_logs CASCADE`);
  await client.query(`DROP TABLE IF EXISTS kyc_verifications CASCADE`);
  await client.query(`DROP TABLE IF EXISTS kyc_documents CASCADE`);
  await client.query(`DROP TABLE IF EXISTS kyc_applications CASCADE`);
  await client.query(`DROP TABLE IF EXISTS kyc_document_types CASCADE`);
}