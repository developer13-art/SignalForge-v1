/**
 * Migration 016 - System Domain
 *
 * @module server/database/migrations/016_create_system_domain
 */

export async function up(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS system_settings (
      key VARCHAR(128) PRIMARY KEY,
      value TEXT,
      value_type VARCHAR(16) NOT NULL DEFAULT 'string',
      category VARCHAR(64),
      description VARCHAR(512),
      is_public BOOLEAN NOT NULL DEFAULT FALSE,
      updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS jobs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      job_type VARCHAR(64) NOT NULL,
      payload JSONB,
      status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
      priority INTEGER NOT NULL DEFAULT 50,
      attempts INTEGER NOT NULL DEFAULT 0,
      max_attempts INTEGER NOT NULL DEFAULT 3,
      scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      started_at TIMESTAMPTZ,
      completed_at TIMESTAMPTZ,
      failed_at TIMESTAMPTZ,
      error TEXT,
      locked_by VARCHAR(64),
      locked_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_jobs_status_scheduled
      ON jobs (status, scheduled_at)
      WHERE status IN ('PENDING', 'RETRYING');
    CREATE INDEX IF NOT EXISTS idx_jobs_job_type
      ON jobs (job_type);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type VARCHAR(64) NOT NULL,
      category VARCHAR(64),
      priority VARCHAR(16) NOT NULL DEFAULT 'NORMAL',
      title VARCHAR(256) NOT NULL,
      body TEXT,
      channels JSONB,
      template_key VARCHAR(128),
      template_data JSONB,
      action_url VARCHAR(1024),
      action_label VARCHAR(64),
      reference_type VARCHAR(64),
      reference_id VARCHAR(128),
      status VARCHAR(32) NOT NULL DEFAULT 'QUEUED',
      read_at TIMESTAMPTZ,
      expires_at TIMESTAMPTZ,
      scheduled_for TIMESTAMPTZ,
      metadata JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_notifications_user_time
      ON notifications (user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_notifications_unread
      ON notifications (user_id)
      WHERE read_at IS NULL;
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS notification_deliveries (
      id BIGSERIAL PRIMARY KEY,
      notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
      channel VARCHAR(32) NOT NULL,
      status VARCHAR(32) NOT NULL,
      attempt INTEGER NOT NULL DEFAULT 1,
      error TEXT,
      provider_reference VARCHAR(128),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS notification_preferences (
      user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      channels JSONB,
      muted_categories JSONB,
      quiet_hours_start VARCHAR(5),
      quiet_hours_end VARCHAR(5),
      timezone VARCHAR(64) DEFAULT 'UTC',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS notification_templates (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      template_key VARCHAR(128) NOT NULL,
      channel VARCHAR(32) NOT NULL,
      locale VARCHAR(8) NOT NULL DEFAULT 'en',
      subject VARCHAR(256),
      body_text TEXT,
      body_html TEXT,
      variables JSONB,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (template_key, channel, locale)
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS user_telegram_notifications (
      user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      chat_id VARCHAR(64) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS user_discord_notifications (
      user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      webhook_url VARCHAR(512) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS user_webhooks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      url VARCHAR(512) NOT NULL,
      secret VARCHAR(128),
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_user_webhooks_user
      ON user_webhooks (user_id)
      WHERE active = TRUE;
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS support_categories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(128) NOT NULL,
      slug VARCHAR(64) NOT NULL UNIQUE,
      description TEXT,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS support_tickets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      ticket_number VARCHAR(32) UNIQUE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      subject VARCHAR(200) NOT NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'OPEN',
      status_reason TEXT,
      priority VARCHAR(16) NOT NULL DEFAULT 'NORMAL',
      category VARCHAR(64) NOT NULL DEFAULT 'GENERAL',
      source VARCHAR(16) NOT NULL DEFAULT 'WEB',
      assigned_agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
      first_responded_at TIMESTAMPTZ,
      resolved_at TIMESTAMPTZ,
      response_due_at TIMESTAMPTZ,
      resolution_due_at TIMESTAMPTZ,
      reopened_count INTEGER NOT NULL DEFAULT 0,
      metadata JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_support_tickets_user
      ON support_tickets (user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_support_tickets_status
      ON support_tickets (status);
    CREATE INDEX IF NOT EXISTS idx_support_tickets_agent
      ON support_tickets (assigned_agent_id)
      WHERE assigned_agent_id IS NOT NULL;
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS support_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
      author_id UUID REFERENCES users(id) ON DELETE SET NULL,
      author_type VARCHAR(16) NOT NULL,
      body TEXT NOT NULL,
      attachments JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_support_messages_ticket
      ON support_messages (ticket_id, created_at ASC);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS support_sla_breaches (
      id BIGSERIAL PRIMARY KEY,
      ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
      breach_type VARCHAR(32) NOT NULL,
      due_at TIMESTAMPTZ,
      minutes_overdue INTEGER,
      recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS knowledge_base_articles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      slug VARCHAR(80) NOT NULL,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(64),
      body TEXT NOT NULL,
      published BOOLEAN NOT NULL DEFAULT TRUE,
      author_id UUID REFERENCES users(id) ON DELETE SET NULL,
      locale VARCHAR(8) NOT NULL DEFAULT 'en',
      tags JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (slug, locale)
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_knowledge_base_published
      ON knowledge_base_articles (locale, published);
  `);
}

export async function down(client) {
  await client.query(`DROP TABLE IF EXISTS knowledge_base_articles CASCADE`);
  await client.query(`DROP TABLE IF EXISTS support_sla_breaches CASCADE`);
  await client.query(`DROP TABLE IF EXISTS support_messages CASCADE`);
  await client.query(`DROP TABLE IF EXISTS support_tickets CASCADE`);
  await client.query(`DROP TABLE IF EXISTS support_categories CASCADE`);
  await client.query(`DROP TABLE IF EXISTS user_webhooks CASCADE`);
  await client.query(`DROP TABLE IF EXISTS user_discord_notifications CASCADE`);
  await client.query(`DROP TABLE IF EXISTS user_telegram_notifications CASCADE`);
  await client.query(`DROP TABLE IF EXISTS notification_templates CASCADE`);
  await client.query(`DROP TABLE IF EXISTS notification_preferences CASCADE`);
  await client.query(`DROP TABLE IF EXISTS notification_deliveries CASCADE`);
  await client.query(`DROP TABLE IF EXISTS notifications CASCADE`);
  await client.query(`DROP TABLE IF EXISTS jobs CASCADE`);
  await client.query(`DROP TABLE IF EXISTS system_settings CASCADE`);
}