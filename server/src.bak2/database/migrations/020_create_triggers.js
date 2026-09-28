/**
 * Migration 020 - Triggers
 *
 * Database-level triggers for cross-cutting concerns: automatic
 * updated_at maintenance and simple integrity rules.
 *
 * @module server/database/migrations/020_create_triggers
 */

const TABLES_WITH_UPDATED_AT = [
  'users',
  'user_profiles',
  'roles',
  'kyc_applications',
  'kyc_document_types',
  'verification_providers',
  'brokers',
  'broker_accounts',
  'signal_sources',
  'telegram_sessions',
  'telegram_channels',
  'discord_connections',
  'discord_guilds',
  'discord_channels',
  'whatsapp_connections',
  'whatsapp_groups',
  'tradingview_integrations',
  'email_connections',
  'signals',
  'provider_dna',
  'provider_dna_rules',
  'providers',
  'provider_certifications',
  'provider_subscriptions',
  'risk_profiles',
  'automation_rules',
  'trades',
  'referral_codes',
  'referral_relationships',
  'referral_rewards',
  'referral_settlements',
  'referral_wallets',
  'subscription_plans',
  'subscriptions',
  'payments',
  'marketplace_listings',
  'marketplace_reviews',
  'trader_profiles',
  'affiliate_partners',
  'affiliate_links',
  'affiliate_referrals',
  'affiliate_commissions',
  'ib_partners',
  'ib_links',
  'ib_referrals',
  'ib_revenue_entries',
  'white_label_projects',
  'white_label_branding',
  'white_label_domains',
  'white_label_themes',
  'white_label_pricing',
  'withdrawal_requests',
  'system_settings',
  'jobs',
  'notifications',
  'notification_preferences',
  'notification_templates',
  'user_webhooks',
  'support_categories',
  'support_tickets',
  'knowledge_base_articles',
  'api_keys',
  'solana_wallets',
  'solana_attestations',
  'solana_provenance',
  'solana_payments',
  'solana_transactions',
];

export async function up(client) {
  await client.query(`
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at := NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  for (const table of TABLES_WITH_UPDATED_AT) {
    await client.query(`
      DROP TRIGGER IF EXISTS trg_${table}_updated_at ON ${table};
    `);

    await client.query(`
      CREATE TRIGGER trg_${table}_updated_at
      BEFORE UPDATE ON ${table}
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at();
    `);
  }
}

export async function down(client) {
  for (const table of TABLES_WITH_UPDATED_AT) {
    await client.query(`DROP TRIGGER IF EXISTS trg_${table}_updated_at ON ${table};`);
  }

  await client.query(`DROP FUNCTION IF EXISTS set_updated_at();`);
}