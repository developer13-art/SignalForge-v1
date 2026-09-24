/**
 * Migration 014 - White Label Domain
 *
 * @module server/database/migrations/014_create_white_label_domain
 */

export async function up(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS white_label_projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      slug VARCHAR(64) NOT NULL UNIQUE,
      name VARCHAR(128) NOT NULL,
      brand_name VARCHAR(128),
      brand_domain VARCHAR(253),
      status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_white_label_projects_owner
      ON white_label_projects (owner_user_id);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS white_label_branding (
      project_id UUID PRIMARY KEY REFERENCES white_label_projects(id) ON DELETE CASCADE,
      brand_name VARCHAR(128),
      logo_url VARCHAR(512),
      favicon_url VARCHAR(512),
      primary_color VARCHAR(32),
      secondary_color VARCHAR(32),
      support_email VARCHAR(254),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS white_label_domains (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID NOT NULL REFERENCES white_label_projects(id) ON DELETE CASCADE,
      domain VARCHAR(253) NOT NULL UNIQUE,
      status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
      verification_token VARCHAR(64) NOT NULL,
      verified_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_white_label_domains_project
      ON white_label_domains (project_id);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS white_label_domain_verification_attempts (
      id BIGSERIAL PRIMARY KEY,
      domain_id UUID NOT NULL REFERENCES white_label_domains(id) ON DELETE CASCADE,
      success BOOLEAN NOT NULL,
      reason VARCHAR(255),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS white_label_themes (
      project_id UUID PRIMARY KEY REFERENCES white_label_projects(id) ON DELETE CASCADE,
      mode VARCHAR(16) NOT NULL DEFAULT 'SYSTEM',
      font_family VARCHAR(128),
      primary_color VARCHAR(32),
      accent_color VARCHAR(32),
      custom_css TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS white_label_pricing (
      project_id UUID PRIMARY KEY REFERENCES white_label_projects(id) ON DELETE CASCADE,
      monthly_price NUMERIC(20,8),
      yearly_price NUMERIC(20,8),
      lifetime_price NUMERIC(20,8),
      enterprise_price NUMERIC(20,8),
      currency VARCHAR(8) NOT NULL DEFAULT 'USD',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

export async function down(client) {
  await client.query(`DROP TABLE IF EXISTS white_label_pricing CASCADE`);
  await client.query(`DROP TABLE IF EXISTS white_label_themes CASCADE`);
  await client.query(`DROP TABLE IF EXISTS white_label_domain_verification_attempts CASCADE`);
  await client.query(`DROP TABLE IF EXISTS white_label_domains CASCADE`);
  await client.query(`DROP TABLE IF EXISTS white_label_branding CASCADE`);
  await client.query(`DROP TABLE IF EXISTS white_label_projects CASCADE`);
}