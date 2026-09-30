'use strict';

async function up(client) {
  await client.query(`
    ALTER TABLE kyc_documents
      ADD COLUMN IF NOT EXISTS user_id UUID,
      ADD COLUMN IF NOT EXISTS encrypted_number TEXT,
      ADD COLUMN IF NOT EXISTS quality_check_result VARCHAR(32),
      ADD COLUMN IF NOT EXISTS quality_check_details JSONB,
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ;

    UPDATE kyc_documents AS document
       SET user_id = application.user_id
      FROM kyc_applications AS application
     WHERE document.application_id = application.id
       AND document.user_id IS NULL;

    UPDATE kyc_documents
       SET encrypted_number = COALESCE(encrypted_number, document_number_encrypted),
           quality_check_details = COALESCE(quality_check_details, metadata),
           created_at = COALESCE(created_at, uploaded_at, NOW());

    ALTER TABLE kyc_documents
      ALTER COLUMN user_id SET NOT NULL,
      ALTER COLUMN created_at SET DEFAULT NOW(),
      ALTER COLUMN created_at SET NOT NULL;
  `);

  await client.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
         WHERE conname = 'kyc_documents_user_id_fkey'
      ) THEN
        ALTER TABLE kyc_documents
          ADD CONSTRAINT kyc_documents_user_id_fkey
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
      END IF;
    END
    $$;
  `);

  await client.query(`
    ALTER TABLE kyc_verifications
      ADD COLUMN IF NOT EXISTS user_id UUID,
      ADD COLUMN IF NOT EXISTS provider VARCHAR(64),
      ADD COLUMN IF NOT EXISTS performed_at TIMESTAMPTZ;

    UPDATE kyc_verifications AS verification
       SET user_id = application.user_id,
           provider = COALESCE(verification.provider, application.provider),
           performed_at = COALESCE(verification.performed_at, verification.created_at, NOW())
      FROM kyc_applications AS application
     WHERE verification.application_id = application.id;

    ALTER TABLE kyc_verifications
      ALTER COLUMN performed_at SET DEFAULT NOW(),
      ALTER COLUMN performed_at SET NOT NULL;
  `);

  await client.query(`
    ALTER TABLE kyc_audit_logs
      ADD COLUMN IF NOT EXISTS application_id UUID REFERENCES kyc_applications(id) ON DELETE CASCADE,
      ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS actor_type VARCHAR(32),
      ADD COLUMN IF NOT EXISTS old_status VARCHAR(32),
      ADD COLUMN IF NOT EXISTS new_status VARCHAR(32),
      ADD COLUMN IF NOT EXISTS metadata JSONB;
  `);

  await client.query(`
    ALTER TABLE kyc_document_types
      ADD COLUMN IF NOT EXISTS enabled BOOLEAN,
      ADD COLUMN IF NOT EXISTS country VARCHAR(3),
      ADD COLUMN IF NOT EXISTS display_order INTEGER;

    UPDATE kyc_document_types
       SET enabled = COALESCE(enabled, active, TRUE),
           display_order = COALESCE(display_order, 0);

    ALTER TABLE kyc_document_types
      ALTER COLUMN enabled SET DEFAULT TRUE,
      ALTER COLUMN enabled SET NOT NULL,
      ALTER COLUMN display_order SET DEFAULT 0,
      ALTER COLUMN display_order SET NOT NULL;

    INSERT INTO kyc_document_types (code, label, description, enabled, display_order)
    VALUES
      ('NATIONAL_ID', 'National Identity Card', 'Government-issued national identity card.', TRUE, 1),
      ('VOTERS_CARD', 'Voter''s Card', 'Government-issued voter identity card.', TRUE, 2),
      ('DRIVERS_LICENSE', 'Driver''s Licence', 'Current government-issued driver licence.', TRUE, 3),
      ('INTERNATIONAL_PASSPORT', 'International Passport', 'Current government-issued passport.', TRUE, 4),
      ('OTHER', 'Other Government ID', 'Another supported government identity document.', TRUE, 5)
    ON CONFLICT (code) DO UPDATE
      SET label = EXCLUDED.label,
          enabled = TRUE,
          display_order = EXCLUDED.display_order;
  `);
}

async function down(client) {
  await client.query(`
    DELETE FROM kyc_document_types
     WHERE code IN ('NATIONAL_ID', 'VOTERS_CARD', 'DRIVERS_LICENSE', 'INTERNATIONAL_PASSPORT', 'OTHER');
    ALTER TABLE kyc_document_types
      DROP COLUMN IF EXISTS display_order,
      DROP COLUMN IF EXISTS country,
      DROP COLUMN IF EXISTS enabled;
    ALTER TABLE kyc_audit_logs
      DROP COLUMN IF EXISTS metadata,
      DROP COLUMN IF EXISTS new_status,
      DROP COLUMN IF EXISTS old_status,
      DROP COLUMN IF EXISTS actor_type,
      DROP COLUMN IF EXISTS user_id,
      DROP COLUMN IF EXISTS application_id;
    ALTER TABLE kyc_verifications
      DROP COLUMN IF EXISTS performed_at,
      DROP COLUMN IF EXISTS provider,
      DROP COLUMN IF EXISTS user_id;
    ALTER TABLE kyc_documents
      DROP CONSTRAINT IF EXISTS kyc_documents_user_id_fkey,
      DROP COLUMN IF EXISTS created_at,
      DROP COLUMN IF EXISTS quality_check_details,
      DROP COLUMN IF EXISTS quality_check_result,
      DROP COLUMN IF EXISTS encrypted_number,
      DROP COLUMN IF EXISTS user_id;
  `);
}

module.exports = { up, down };