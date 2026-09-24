/**
 * Database Test Helper
 *
 * @module server/tests/helpers/db.helper
 */

import { db } from '../../src/database';

export async function truncateAll() {
  const tables = [
    'solana_indexer_events',
    'solana_indexer_checkpoints',
    'solana_transactions',
    'solana_payments',
    'solana_provenance',
    'solana_attestations',
    'solana_wallets',
    'api_keys',
    'admin_actions',
    'security_threats',
    'audit_logs',
    'notification_preferences',
    'notification_templates',
    'notification_deliveries',
    'notifications',
    'jobs',
    'system_settings',
    'withdrawal_requests',
    'white_label_pricing',
    'white_label_themes',
    'white_label_domain_verification_attempts',
    'white_label_domains',
    'white_label_branding',
    'white_label_projects',
    'ib_revenue_entries',
    'ib_referrals',
    'ib_links',
    'ib_partners',
    'affiliate_commissions',
    'affiliate_referrals',
    'affiliate_links',
    'affiliate_partners',
    'trader_style_assignments',
    'trading_styles',
    'trader_behavior_metrics',
    'trader_followers',
    'trader_profiles',
    'marketplace_reviews',
    'marketplace_listings',
    'wallet_ledger',
    'invoices',
    'payment_events',
    'payments',
    'subscriptions',
    'subscription_plans',
    'referral_ledger',
    'referral_wallets',
    'referral_settlements',
    'referral_rewards',
    'referral_relationships',
    'referral_codes',
    'trade_analytics_daily',
    'equity_snapshots',
    'performance_metrics',
    'performance_periods',
    'execution_requests',
    'execution_logs',
    'risk_decisions',
    'trade_shadows',
    'trade_events',
    'trades',
    'automation_rules',
    'risk_profiles',
    'provider_revenue',
    'provider_subscriptions',
    'provider_certifications',
    'provider_followers',
    'providers',
    'provider_dna_feedback',
    'provider_dna_rules',
    'provider_dna',
    'signal_consensus_members',
    'signal_consensus',
    'signal_fingerprints',
    'signal_events',
    'signal_parses',
    'signals',
    'message_fingerprints',
    'source_messages',
    'email_connections',
    'tradingview_integrations',
    'whatsapp_groups',
    'whatsapp_connections',
    'discord_channels',
    'discord_guilds',
    'discord_connections',
    'telegram_otp_requests',
    'telegram_channels',
    'telegram_sessions',
    'telegram_pending_sessions',
    'signal_sources',
    'connection_logs',
    'account_snapshots',
    'broker_accounts',
    'brokers',
    'compliance_audit_log',
    'kyc_risk_flags',
    'kyc_audit_logs',
    'kyc_verifications',
    'kyc_documents',
    'kyc_applications',
    'kyc_document_types',
    'verification_providers',
    'user_permissions',
    'role_permissions',
    'user_roles',
    'permissions',
    'roles',
    'login_attempts',
    'user_devices',
    'two_factor_auth',
    'user_sessions',
    'user_profiles',
    'users',
  ];

  for (const table of tables) {
    try {
      await db.query(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`);
    } catch (err) {
      // ignore tables that don't exist in the current schema
    }
  }
}

export async function countRows(table) {
  const { rows } = await db.query(`SELECT COUNT(*)::int AS count FROM ${table}`);
  return rows[0].count;
}

export const dbHelper = {
  truncateAll,
  countRows,
};