/**
 * Migration 005 - Signal Sources Domain
 *
 * @module server/database/migrations/005_create_signal_sources_domain
 */

export async function up(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS signal_sources (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      source_type VARCHAR(32) NOT NULL,
      display_name VARCHAR(128),
      connection_status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
      config JSONB,
      last_activity_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_signal_sources_user ON signal_sources (user_id);
    CREATE INDEX IF NOT EXISTS idx_signal_sources_type ON signal_sources (source_type);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS telegram_pending_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      phone_number VARCHAR(32) NOT NULL,
      country_code VARCHAR(8),
      phone_code_hash TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_telegram_pending_expires
      ON telegram_pending_sessions (expires_at);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS telegram_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      session_ciphertext TEXT NOT NULL,
      telegram_user_id VARCHAR(64),
      telegram_username VARCHAR(64),
      connected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_used_at TIMESTAMPTZ,
      revoked_at TIMESTAMPTZ,
      revoked_reason TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_telegram_sessions_user
      ON telegram_sessions (user_id)
      WHERE revoked_at IS NULL;
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS telegram_channels (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      channel_id VARCHAR(64) NOT NULL,
      title VARCHAR(255),
      type VARCHAR(32),
      username VARCHAR(128),
      participants_count INTEGER,
      monitored BOOLEAN NOT NULL DEFAULT FALSE,
      opted_in_at TIMESTAMPTZ,
      discovered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (user_id, channel_id)
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_telegram_channels_monitored
      ON telegram_channels (user_id)
      WHERE monitored = TRUE;
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS telegram_otp_requests (
      id BIGSERIAL PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      phone_number VARCHAR(32),
      requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_telegram_otp_user_time
      ON telegram_otp_requests (user_id, requested_at DESC);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS discord_connections (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      access_token_cipher TEXT NOT NULL,
      refresh_token_cipher TEXT,
      scope VARCHAR(128),
      expires_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS discord_guilds (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      guild_id VARCHAR(32) NOT NULL,
      name VARCHAR(255),
      icon VARCHAR(128),
      owner BOOLEAN NOT NULL DEFAULT FALSE,
      permissions VARCHAR(64),
      manageable BOOLEAN NOT NULL DEFAULT FALSE,
      discovered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (user_id, guild_id)
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS discord_channels (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      guild_id VARCHAR(32) NOT NULL,
      channel_id VARCHAR(32) NOT NULL,
      name VARCHAR(255),
      type INTEGER,
      position INTEGER,
      nsfw BOOLEAN NOT NULL DEFAULT FALSE,
      monitored BOOLEAN NOT NULL DEFAULT FALSE,
      opted_in_at TIMESTAMPTZ,
      discovered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (user_id, channel_id)
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_discord_channels_monitored
      ON discord_channels (user_id)
      WHERE monitored = TRUE;
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS whatsapp_connections (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      phone_number_id VARCHAR(64) NOT NULL,
      business_account_id VARCHAR(64),
      access_token_cipher TEXT NOT NULL,
      display_phone_number VARCHAR(32),
      verified_name VARCHAR(128),
      provider VARCHAR(32) DEFAULT 'CLOUD',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS whatsapp_groups (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      group_id VARCHAR(128) NOT NULL,
      name VARCHAR(255),
      participants_count INTEGER,
      monitored BOOLEAN NOT NULL DEFAULT FALSE,
      opted_in_at TIMESTAMPTZ,
      discovered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (user_id, group_id)
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS tradingview_integrations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      route_token VARCHAR(64) NOT NULL UNIQUE,
      secret TEXT NOT NULL,
      label VARCHAR(128),
      active BOOLEAN NOT NULL DEFAULT TRUE,
      last_delivered_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_tradingview_integrations_user
      ON tradingview_integrations (user_id);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS email_connections (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      host VARCHAR(128) NOT NULL,
      port INTEGER NOT NULL,
      imap_user VARCHAR(255) NOT NULL,
      password_cipher TEXT NOT NULL,
      secure BOOLEAN NOT NULL DEFAULT TRUE,
      mailbox VARCHAR(128) NOT NULL DEFAULT 'INBOX',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS source_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      source_type VARCHAR(32) NOT NULL,
      source_id VARCHAR(128),
      channel_id VARCHAR(128),
      external_message_id VARCHAR(128),
      sender_id VARCHAR(128),
      sender_name VARCHAR(255),
      text TEXT,
      media JSONB,
      attachments JSONB,
      reply_to VARCHAR(128),
      timestamp TIMESTAMPTZ,
      idempotency_key VARCHAR(512) NOT NULL UNIQUE,
      fingerprint VARCHAR(64),
      envelope JSONB,
      processing_status VARCHAR(32) NOT NULL DEFAULT 'RECEIVED',
      is_edited BOOLEAN NOT NULL DEFAULT FALSE,
      is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_source_messages_user_time
      ON source_messages (user_id, timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_source_messages_source
      ON source_messages (source_type, source_id);
    CREATE INDEX IF NOT EXISTS idx_source_messages_fingerprint
      ON source_messages (fingerprint);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS message_fingerprints (
      id BIGSERIAL PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      message_id UUID NOT NULL REFERENCES source_messages(id) ON DELETE CASCADE,
      fingerprint VARCHAR(64) NOT NULL,
      source_type VARCHAR(32),
      source_id VARCHAR(128),
      external_message_id VARCHAR(128),
      timestamp TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (fingerprint, user_id)
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_message_fingerprints_user
      ON message_fingerprints (user_id);
  `);
}

export async function down(client) {
  await client.query(`DROP TABLE IF EXISTS message_fingerprints CASCADE`);
  await client.query(`DROP TABLE IF EXISTS source_messages CASCADE`);
  await client.query(`DROP TABLE IF EXISTS email_connections CASCADE`);
  await client.query(`DROP TABLE IF EXISTS tradingview_integrations CASCADE`);
  await client.query(`DROP TABLE IF EXISTS whatsapp_groups CASCADE`);
  await client.query(`DROP TABLE IF EXISTS whatsapp_connections CASCADE`);
  await client.query(`DROP TABLE IF EXISTS discord_channels CASCADE`);
  await client.query(`DROP TABLE IF EXISTS discord_guilds CASCADE`);
  await client.query(`DROP TABLE IF EXISTS discord_connections CASCADE`);
  await client.query(`DROP TABLE IF EXISTS telegram_otp_requests CASCADE`);
  await client.query(`DROP TABLE IF EXISTS telegram_channels CASCADE`);
  await client.query(`DROP TABLE IF EXISTS telegram_sessions CASCADE`);
  await client.query(`DROP TABLE IF EXISTS telegram_pending_sessions CASCADE`);
  await client.query(`DROP TABLE IF EXISTS signal_sources CASCADE`);
}