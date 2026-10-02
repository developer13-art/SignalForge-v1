'use strict';

/**
 * SignalForge - Complete Seed Script
 *
 * Seeds reference data and demo activity for every domain of the
 * platform so that all features can be exercised end to end.
 *
 * Usage:
 *   node scripts/seed-all.js             additive (idempotent)
 *   node scripts/seed-all.js --reset     delete seeded rows first
 *
 * Every seeded user has the password: TestPassword1
 *
 * @module signalforge/server/scripts/seed-all
 */

require('dotenv').config();

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const RESET = process.argv.includes('--reset');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
function uuid() {
  return crypto.randomUUID();
}

function daysAgo(n) {
  return new Date(Date.now() - n * 86400000);
}

function hoursAgo(n) {
  return new Date(Date.now() - n * 3600000);
}

function minutesAgo(n) {
  return new Date(Date.now() - n * 60000);
}

function log(message) {
  // eslint-disable-next-line no-console
  console.log(`[seed] ${message}`);
}

async function q(text, params) {
  return pool.query(text, params);
}

async function insertOne(text, params) {
  const r = await pool.query(text, params);
  return r.rows[0] || null;
}

async function safeExec(sql, params = []) {
  try {
    await pool.query(sql, params);
  } catch (_error) {
    // Table may not exist in this environment; ignore.
  }
}

// ---------------------------------------------------------------------
// Reset
// ---------------------------------------------------------------------

const RESET_TABLES = [
  'solana_blink_receipts', 'solana_blink_conversions', 'solana_blink_clicks',
  'solana_blink_shares', 'solana_blinks', 'solana_proof_verifications',
  'solana_proof_memo_submissions', 'solana_proof_fetches', 'solana_proof_records',
  'solana_leaderboard_cache', 'solana_leaderboard_history',
  'solana_actions_confirmations', 'solana_actions_idempotency',
  'solana_payments', 'solana_wallets',
  'crypto_position_events', 'crypto_positions', 'dex_orders', 'dex_swaps',
  'execution_route_logs', 'execution_routes', 'execution_route_policies',
  'execution_instruments', 'wallet_trading_accounts',
  'crypto_liquidity_latest', 'crypto_liquidity_snapshots', 'crypto_volume_rollups',
  'crypto_price_latest', 'crypto_price_snapshots', 'crypto_token_metadata',
  'crypto_pools', 'crypto_symbol_aliases', 'crypto_symbols',
  'reviews', 'marketplace_listings',
  'trader_behavior_metrics', 'trader_style_assignments', 'trading_styles',
  'trader_followers', 'trader_profiles',
  'affiliate_commissions', 'affiliate_referrals', 'affiliate_partners',
  'ib_referrals', 'ib_links', 'white_label_projects',
  'referral_ledger', 'referral_rewards', 'referral_wallets',
  'referral_relationships', 'referral_settlements', 'referral_codes',
  'performance_periods', 'equity_snapshots', 'performance_metrics',
  'trade_shadows', 'trade_events', 'trades',
  'automation_rules', 'risk_profiles',
  'account_snapshots', 'broker_accounts', 'brokers',
  'signal_consensus_members', 'signal_consensus', 'signal_fingerprints',
  'signal_parses', 'signals',
  'provider_dna_rules', 'provider_dna',
  'source_messages', 'telegram_channels', 'telegram_connections',
  'signal_sources',
  'provider_certifications', 'providers',
  'withdrawal_requests', 'wallet_ledger', 'wallets',
  'payment_events', 'payments', 'subscriptions', 'subscription_plans',
  'kyc_audit_logs', 'kyc_verifications', 'kyc_documents', 'kyc_document_types',
  'kyc_applications',
  'api_keys', 'user_sessions', 'two_factor_auth',
  'user_roles', 'role_permissions', 'permissions', 'roles',
  'user_profiles', 'users',
  'notifications', 'audit_logs', 'system_settings',
];

async function resetAll() {
  log('Reset requested. Deleting seeded rows in reverse FK order.');
  for (const table of RESET_TABLES) {
    await safeExec(`DELETE FROM ${table}`);
  }
  log('Reset complete.');
}

// ---------------------------------------------------------------------
// Reference data
// ---------------------------------------------------------------------

async function seedRoles() {
  log('Seeding roles and permissions.');
  const roles = [
    ['USER', 'Standard platform user.'],
    ['PROVIDER', 'Signal provider with subscription plans.'],
    ['TRADER', 'Manual trader followed via copy trading.'],
    ['MODERATOR', 'Content and marketplace moderator.'],
    ['COMPLIANCE_OFFICER', 'KYC and compliance reviewer.'],
    ['FINANCE_ADMIN', 'Finance and payment operations.'],
    ['SUPPORT', 'Customer support agent.'],
    ['ADMIN', 'Platform administrator.'],
    ['SUPER_ADMIN', 'Root administrator.'],
  ];
  const roleMap = {};
  for (const [name, description] of roles) {
    const row = await insertOne(
      `INSERT INTO roles (id, name, description, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
       RETURNING id, name`,
      [uuid(), name, description],
    );
    roleMap[name] = row;
  }

  const permissions = [
    'users.read', 'users.update', 'users.manage',
    'kyc.review', 'kyc.approve',
    'payments.view', 'payments.manage', 'referrals.settle',
    'providers.approve', 'signals.monitor', 'trades.view',
    'system.configure', 'audit.logs.view',
    'blinks.create', 'blinks.view', 'blinks.manage', 'blinks.view_analytics', 'blinks.approve',
    'proof_of_alpha.view', 'proof_of_alpha.write', 'proof_of_alpha.verify',
    'leaderboard.view', 'leaderboard.manage',
    'crypto_trading.enable', 'crypto_trading.view', 'crypto_trading.configure',
    'dex_routing.view', 'dex_routing.configure',
    'market_data.view', 'market_data.manage',
  ];
  const permMap = {};
  for (const name of permissions) {
    const row = await insertOne(
      `INSERT INTO permissions (id, name, description, created_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
       RETURNING id, name`,
      [uuid(), name, name],
    );
    if (row) {
      permMap[name] = row;
    } else {
      const existing = await q(`SELECT id, name FROM permissions WHERE name = $1`, [name]);
      permMap[name] = existing.rows[0];
    }
  }

  const rolePermissions = {
    USER: ['users.read', 'blinks.view', 'proof_of_alpha.view', 'leaderboard.view',
      'crypto_trading.enable', 'crypto_trading.view', 'market_data.view'],
    PROVIDER: ['users.read', 'blinks.create', 'blinks.view', 'blinks.view_analytics',
      'proof_of_alpha.view', 'leaderboard.view', 'crypto_trading.view', 'market_data.view'],
    TRADER: ['users.read', 'blinks.view', 'proof_of_alpha.view', 'leaderboard.view',
      'crypto_trading.view', 'market_data.view'],
    MODERATOR: ['users.read', 'blinks.view', 'blinks.manage', 'proof_of_alpha.view',
      'leaderboard.view', 'leaderboard.manage', 'market_data.view'],
    COMPLIANCE_OFFICER: ['users.read', 'kyc.review', 'kyc.approve', 'blinks.view',
      'proof_of_alpha.view', 'leaderboard.view'],
    FINANCE_ADMIN: ['users.read', 'payments.view', 'payments.manage', 'referrals.settle',
      'blinks.view', 'blinks.view_analytics', 'proof_of_alpha.view', 'leaderboard.view'],
    SUPPORT: ['users.read', 'users.update', 'blinks.view', 'proof_of_alpha.view',
      'leaderboard.view', 'market_data.view'],
    ADMIN: permissions.filter((p) => p !== 'system.configure'),
    SUPER_ADMIN: permissions,
  };

  for (const [roleName, perms] of Object.entries(rolePermissions)) {
    const role = roleMap[roleName];
    if (!role) continue;
    for (const permName of perms) {
      const perm = permMap[permName];
      if (!perm) continue;
      await safeExec(
        `INSERT INTO role_permissions (role_id, permission_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [role.id, perm.id],
      );
    }
  }
  return roleMap;
}

async function seedPlans() {
  log('Seeding subscription plans.');
  const plans = [
    ['MONTHLY', 'Monthly', 19.00, 'month', { sources: 3, brokers: 1 }],
    ['YEARLY', 'Yearly', 190.00, 'year', { sources: 10, brokers: 3 }],
    ['LIFETIME', 'Lifetime', 499.00, 'lifetime', { sources: -1, brokers: -1 }],
  ];
  const map = {};
  for (const [code, name, price, interval, features] of plans) {
    const row = await insertOne(
      `INSERT INTO subscription_plans (
         id, code, name, price, currency, billing_interval, features,
         active, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, 'USD', $5, $6, TRUE, NOW(), NOW())
       ON CONFLICT (code) DO UPDATE SET
         name = EXCLUDED.name,
         price = EXCLUDED.price,
         features = EXCLUDED.features,
         active = EXCLUDED.active
       RETURNING id, code, price`,
      [uuid(), code, name, price, interval, JSON.stringify(features)],
    );
    map[code] = row;
  }
  return map;
}

async function seedKycDocumentTypes() {
  log('Seeding KYC document types.');
  const types = [
    ['NATIONAL_ID', 'National ID Card'],
    ['VOTERS_CARD', "Voter's Card"],
    ['DRIVERS_LICENSE', "Driver's Licence"],
    ['PASSPORT', 'International Passport'],
    ['RESIDENCE_PERMIT', 'Residence Permit'],
    ['OTHER', 'Other Approved Document'],
  ];
  const map = {};
  for (const [code, label] of types) {
    const row = await insertOne(
      `INSERT INTO kyc_document_types (id, code, label, description, enabled, display_order, created_at, updated_at)
       VALUES ($1, $2, $3, $4, TRUE, 0, NOW(), NOW())
       ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label
       RETURNING id, code`,
      [uuid(), code, label, label],
    );
    map[code] = row;
  }
  return map;
}

async function seedBrokers() {
  log('Seeding brokers.');
  const brokers = [
    ['METAQUOTES', 'MetaQuotes', 'MT5'],
    ['EXNESS', 'Exness', 'MT5'],
    ['XM', 'XM Global', 'MT5'],
    ['ICMARKETS', 'IC Markets', 'MT5'],
    ['PEPPERSTONE', 'Pepperstone', 'MT5'],
    ['FXTM', 'FXTM', 'MT5'],
    ['HOTFOREX', 'HotForex', 'MT4'],
    ['OANDA', 'OANDA', 'MT5'],
  ];
  const map = {};
  for (const [code, name, platform] of brokers) {
    const row = await insertOne(
      `INSERT INTO brokers (id, name, platform, active, created_at, updated_at)
       VALUES ($1, $2, $3, TRUE, NOW(), NOW())
       ON CONFLICT (name) DO UPDATE SET
         platform = EXCLUDED.platform,
         active = EXCLUDED.active
       RETURNING id, name`,
      [uuid(), name, platform],
    );
    map[code] = row;
  }
  return map;
}

async function seedSystemSettings() {
  log('Seeding system settings.');
  const settings = [
    ['referral.reward_rate', '0.001', 'number'],
    ['referral.settlement', 'monthly', 'string'],
    ['referral.min_payout', '10', 'number'],
    ['kyc.required_for_subscription', 'true', 'boolean'],
    ['kyc.required_for_referral', 'true', 'boolean'],
    ['kyc.required_for_trading', 'true', 'boolean'],
    ['subscription.trial_days', '7', 'number'],
    ['subscription.grace_period_days', '3', 'number'],
    ['signal.confidence_threshold', '0.80', 'number'],
    ['risk.max_daily_loss', '500', 'number'],
    ['risk.max_drawdown', '0.20', 'number'],
    ['risk.max_open_trades', '10', 'number'],
    ['feature.solana_actions', 'true', 'boolean'],
    ['feature.proof_of_alpha', 'true', 'boolean'],
    ['feature.crypto_trading', 'true', 'boolean'],
    ['feature.marketplace', 'true', 'boolean'],
    ['feature.referrals', 'true', 'boolean'],
    ['feature.white_label', 'false', 'boolean'],
  ];
  for (const [key, value, type] of settings) {
    await safeExec(
      `INSERT INTO system_settings (key, value, type, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [key, value, type],
    );
  }
}

async function seedCryptoReference() {
  log('Seeding crypto tokens and pairs.');
  const tokens = [
    ['USDC', 'USD Coin', 6, 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'],
    ['USDT', 'Tether USD', 6, 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'],
    ['SOL', 'Solana', 9, 'So11111111111111111111111111111111111111112'],
    ['BTC', 'Bitcoin (Wormhole)', 8, '3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh'],
    ['ETH', 'Ethereum (Wormhole)', 8, '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs'],
    ['JUP', 'Jupiter', 6, 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN'],
    ['BONK', 'Bonk', 5, 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263'],
    ['PYTH', 'Pyth Network', 6, 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3'],
    ['RAY', 'Raydium', 6, '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R'],
    ['ORCA', 'Orca', 6, 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE'],
  ];
  for (const [symbol, name, decimals, mint] of tokens) {
    await safeExec(
      `INSERT INTO crypto_token_metadata (mint, symbol, name, decimals, is_verified, source, created_at, updated_at)
       VALUES ($1, $2, $3, $4, TRUE, 'seed', NOW(), NOW())
       ON CONFLICT (mint) DO NOTHING`,
      [mint, symbol, name, decimals],
    );
  }

  const pairs = [
    ['BTC', 'USDT'], ['BTC', 'USDC'], ['ETH', 'USDT'], ['ETH', 'USDC'],
    ['SOL', 'USDT'], ['SOL', 'USDC'], ['JUP', 'USDT'], ['JUP', 'USDC'],
    ['BONK', 'USDT'], ['PYTH', 'USDT'], ['RAY', 'USDT'], ['ORCA', 'USDT'],
  ];
  for (const [base, quote] of pairs) {
    await safeExec(
      `INSERT INTO crypto_symbols (
         id, canonical_symbol, base_asset, quote_asset, symbol_class,
         is_perp, is_swap, is_stable_pair, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, 'crypto_spot', FALSE, FALSE, FALSE, NOW(), NOW())
       ON CONFLICT (canonical_symbol) DO NOTHING`,
      [uuid(), `${base}/${quote}`, base, quote],
    );
  }
}

// ---------------------------------------------------------------------
// Identity + KYC
// ---------------------------------------------------------------------

const PASSWORD = 'TestPassword1';

async function seedUsersAndKyc(roleMap, docTypes) {
  log('Seeding users, profiles, roles, sessions, KYC.');
  const hash = await bcrypt.hash(PASSWORD, 10);

  const users = [
    { key: 'superadmin', email: 'superadmin@signalforge.local', first: 'Super', last: 'Admin', role: 'SUPER_ADMIN', kyc: 'VERIFIED' },
    { key: 'admin', email: 'admin@signalforge.local', first: 'Platform', last: 'Admin', role: 'ADMIN', kyc: 'VERIFIED' },
    { key: 'compliance', email: 'compliance@signalforge.local', first: 'Compliance', last: 'Officer', role: 'COMPLIANCE_OFFICER', kyc: 'VERIFIED' },
    { key: 'finance', email: 'finance@signalforge.local', first: 'Finance', last: 'Admin', role: 'FINANCE_ADMIN', kyc: 'VERIFIED' },
    { key: 'support', email: 'support@signalforge.local', first: 'Support', last: 'Agent', role: 'SUPPORT', kyc: 'VERIFIED' },
    { key: 'provider1', email: 'provider@signalforge.local', first: 'FX', last: 'Ninja', role: 'PROVIDER', kyc: 'VERIFIED' },
    { key: 'provider2', email: 'provider2@signalforge.local', first: 'Gold', last: 'Pro', role: 'PROVIDER', kyc: 'VERIFIED' },
    { key: 'trader1', email: 'trader1@signalforge.local', first: 'Alice', last: 'Trader', role: 'USER', kyc: 'VERIFIED' },
    { key: 'trader2', email: 'trader2@signalforge.local', first: 'Bob', last: 'Trader', role: 'USER', kyc: 'PENDING' },
    { key: 'trader3', email: 'trader3@signalforge.local', first: 'Carol', last: 'Trader', role: 'USER', kyc: 'REJECTED' },
    { key: 'trader4', email: 'trader4@signalforge.local', first: 'Dave', last: 'Trader', role: 'USER', kyc: 'NOT_STARTED' },
    { key: 'test', email: 'test@signalforge.local', first: 'Test', last: 'User', role: 'USER', kyc: 'NOT_STARTED' },
  ];

  const userMap = {};
  for (const u of users) {
    const row = await insertOne(
      `INSERT INTO users (
         id, email, password_hash, first_name, last_name, status, kyc_status,
         email_verified_at, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, 'ACTIVE', $6, NOW(), NOW(), NOW())
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
       RETURNING id, email`,
      [uuid(), u.email, hash, u.first, u.last, u.kyc],
    );
    userMap[u.key] = { ...row, ...u };

    await safeExec(
      `INSERT INTO user_profiles (id, user_id, first_name, last_name, country, language, phone, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'NG', 'en', NULL, NOW(), NOW())
       ON CONFLICT (user_id) DO NOTHING`,
      [uuid(), row.id, u.first, u.last],
    );

    const role = roleMap[u.role];
    if (role) {
      await safeExec(
        `INSERT INTO user_roles (user_id, role_id, created_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT DO NOTHING`,
        [row.id, role.id],
      );
    }

    await safeExec(
      `INSERT INTO user_sessions (id, user_id, token_hash, ip, user_agent, expires_at, created_at, last_used_at)
       VALUES ($1, $2, $3, '127.0.0.1', 'seed', NOW() + INTERVAL '30 days', NOW(), NOW())`,
      [uuid(), row.id, crypto.randomBytes(32).toString('hex')],
    );
  }

  // KYC applications
  const kycStates = [
    ['trader1', 'VERIFIED'],
    ['trader2', 'PENDING'],
    ['trader3', 'REJECTED'],
    ['trader4', 'NOT_STARTED'],
    ['provider1', 'VERIFIED'],
    ['provider2', 'VERIFIED'],
  ];

  for (const [userKey, status] of kycStates) {
    const u = userMap[userKey];
    if (!u) continue;
    const app = await insertOne(
      `INSERT INTO kyc_applications (id, user_id, status, provider, personal_info, created_at, updated_at)
       VALUES ($1, $2, $3, 'internal', $4, NOW(), NOW())
       RETURNING id`,
      [
        uuid(),
        u.id,
        status,
        JSON.stringify({
          firstName: u.first,
          lastName: u.last,
          dateOfBirth: '1990-01-01',
          nationality: 'NG',
          country: 'NG',
          addressLine1: '1 Test Street',
          city: 'Lagos',
          phone: '+2348000000000',
        }),
      ],
    );

    if (status === 'VERIFIED') {
      await safeExec(
        `INSERT INTO kyc_verifications (
           id, application_id, user_id, provider, document_check, identity_check,
           liveness_check, name_match, dob_match, risk_score, result, performed_at, created_at
         ) VALUES ($1, $2, $3, 'internal', TRUE, TRUE, TRUE, TRUE, TRUE, 0, 'APPROVED', NOW(), NOW())`,
        [uuid(), app.id, u.id],
      );
    }

    await safeExec(
      `INSERT INTO kyc_audit_logs (
         id, application_id, user_id, actor_id, actor_type, action, new_status, created_at
       ) VALUES ($1, $2, $3, $3, 'SYSTEM', 'STATUS_CHANGE', $4, NOW())`,
      [uuid(), app.id, u.id, status],
    );
  }

  return userMap;
}

// ---------------------------------------------------------------------
// Commerce (subscriptions, payments, wallet, ledger)
// ---------------------------------------------------------------------

async function seedCommerce(userMap, plans) {
  log('Seeding subscriptions, payments, wallets, ledger.');
  const monthly = plans.MONTHLY;
  const yearly = plans.YEARLY;

  const subscriptions = [
    ['trader1', monthly, 'ACTIVE'],
    ['trader2', monthly, 'PAST_DUE'],
    ['trader3', monthly, 'CANCELLED'],
    ['trader4', monthly, 'TRIAL'],
    ['provider1', yearly, 'ACTIVE'],
    ['provider2', yearly, 'ACTIVE'],
  ];

  for (const [userKey, plan, status] of subscriptions) {
    const u = userMap[userKey];
    if (!u || !plan) continue;

    await safeExec(
      `INSERT INTO subscriptions (
         id, user_id, plan_id, status, current_period_start, current_period_end, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
      [
        uuid(),
        u.id,
        plan.id,
        status,
        daysAgo(15),
        new Date(Date.now() + 15 * 86400000),
      ],
    );

    if (status === 'ACTIVE' || status === 'PAST_DUE') {
      await safeExec(
        `INSERT INTO payments (
           id, user_id, plan_id, amount, currency, provider, status, paid_at, created_at, updated_at
         ) VALUES ($1, $2, $3, $4, 'USD', 'stripe', 'SUCCEEDED', NOW(), NOW(), NOW())`,
        [uuid(), u.id, plan.id, plan.price],
      );
    }
  }

  // Wallet balances are seeded with a matching, idempotent ledger credit.
  for (const userKey of ['trader1', 'provider1', 'provider2']) {
    const u = userMap[userKey];
    if (!u) continue;

    const client = await pool.connect();
    const amount = userKey === 'trader1' ? 50 : 250;
    try {
      await client.query('BEGIN');
      await client.query(
        `INSERT INTO wallets (user_id, wallet_type, currency, status)
         VALUES ($1, 'USER', 'USD', 'ACTIVE')
         ON CONFLICT (user_id, wallet_type, currency) DO NOTHING`,
        [u.id],
      );
      const walletResult = await client.query(
        `SELECT id, available_balance, total_balance
           FROM wallets
          WHERE user_id = $1 AND wallet_type = 'USER' AND currency = 'USD'
          FOR UPDATE`,
        [u.id],
      );
      const wallet = walletResult.rows[0];
      const balanceBefore = Number(wallet.total_balance || 0);
      const balanceAfter = balanceBefore + amount;
      const ledgerResult = await client.query(
        `INSERT INTO wallet_ledger (
           wallet_id, user_id, entry_type, direction, amount, currency,
           balance_before, balance_after, reference_type, reference_id,
           description, status, metadata, recorded_at, created_at
         ) VALUES ($1, $2, 'SEED_TOP_UP', 'CREDIT', $3, 'USD', $4, $5,
                   'SEED_TOP_UP', $2, 'Seed top-up', 'POSTED', '{"seed":true}'::jsonb, NOW(), NOW())
         ON CONFLICT (reference_type, reference_id)
           WHERE reference_type = 'SEED_TOP_UP' AND reference_id IS NOT NULL
         DO NOTHING
         RETURNING id`,
        [wallet.id, u.id, amount, balanceBefore, balanceAfter],
      );
      if (ledgerResult.rowCount > 0) {
        await client.query(
          `UPDATE wallets
              SET available_balance = available_balance + $1,
                  total_balance = total_balance + $1,
                  lifetime_credited = lifetime_credited + $1
            WHERE id = $2`,
          [amount, wallet.id],
        );
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

// ---------------------------------------------------------------------
// Referrals
// ---------------------------------------------------------------------

async function seedReferrals(userMap) {
  log('Seeding referrals.');
  const referrers = ['trader1', 'provider1'];
  const codeMap = {};

  for (const key of referrers) {
    const u = userMap[key];
    if (!u) continue;
    const code = await insertOne(
      `INSERT INTO referral_codes (id, user_id, code, active, created_at, updated_at)
       VALUES ($1, $2, $3, TRUE, NOW(), NOW())
       ON CONFLICT (user_id) DO UPDATE SET active = TRUE
       RETURNING id, code`,
      [uuid(), u.id, `SF${key.toUpperCase().slice(0, 6)}${Math.floor(Math.random() * 900 + 100)}`],
    );
    if (code) codeMap[key] = code;
  }

  const trader1Code = codeMap.trader1;
  if (trader1Code) {
    for (const referredKey of ['trader2', 'trader3', 'trader4']) {
      const ref = userMap[referredKey];
      if (!ref) continue;
      await safeExec(
        `INSERT INTO referral_relationships (
           id, referrer_id, referred_user_id, referral_code_id, status, created_at, updated_at
         ) VALUES ($1, $2, $3, $4, 'ACTIVE', NOW(), NOW())
         ON CONFLICT (referred_user_id) DO NOTHING`,
        [uuid(), userMap.trader1.id, ref.id, trader1Code.id],
      );
    }

    // Sample rewards
    for (const referredKey of ['trader2', 'trader3', 'trader4']) {
      const ref = userMap[referredKey];
      if (!ref) continue;
      await safeExec(
        `INSERT INTO referral_rewards (
           id, referrer_id, referred_user_id, settlement_period, eligible_net_profit,
           reward_rate, reward_amount, status, created_at, updated_at
         ) SELECT $1, $2, $3, '2026-08', 3000, 0.001, 3.00, 'APPROVED', NOW(), NOW()
           WHERE NOT EXISTS (
             SELECT 1 FROM referral_rewards
              WHERE referrer_id = $2 AND referred_user_id = $3
                AND settlement_period = '2026-08'
           )`,
        [uuid(), userMap.trader1.id, ref.id],
      );
    }
  }

  // Referral wallet
  await safeExec(
    `INSERT INTO referral_wallets (
       id, user_id, pending_balance, available_balance, lifetime_earned, lifetime_withdrawn, created_at, updated_at
     ) VALUES ($1, $2, 8.20, 125.40, 133.60, 0, NOW(), NOW())
     ON CONFLICT (user_id) DO NOTHING`,
    [uuid(), userMap.trader1.id],
  );
}

// ---------------------------------------------------------------------
// Providers, sources, signals, DNA
// ---------------------------------------------------------------------

async function seedProviders(userMap) {
  log('Seeding providers.');
  const rows = {};
  const defs = [
    { key: 'provider1', name: 'FX Ninja', description: 'Forex and metals.', winRate: 68, verified: true },
    { key: 'provider2', name: 'Gold Pro', description: 'XAUUSD specialist.', winRate: 72, verified: true },
  ];
  for (const def of defs) {
    const u = userMap[def.key];
    if (!u) continue;
    const row = await insertOne(
      `INSERT INTO providers (
         id, user_id, display_name, description, status, certification_status,
         certified_at, created_at, updated_at
         ) VALUES ($1, $2, $3, $4, 'ACTIVE', $5, $6, NOW(), NOW())
       ON CONFLICT (user_id) DO UPDATE
         SET display_name = EXCLUDED.display_name,
             description = EXCLUDED.description,
             status = EXCLUDED.status,
             certification_status = EXCLUDED.certification_status,
             certified_at = EXCLUDED.certified_at,
             updated_at = NOW()
       RETURNING id, display_name AS name`,
      [
        uuid(), u.id, def.name, def.description,
        def.verified ? 'CERTIFIED' : 'PENDING',
        def.verified ? new Date() : null,
      ],
    );
    if (row) rows[def.key] = row;
  }
  return rows;
}

async function seedSignalSources(userMap, providerMap) {
  log('Seeding signal sources, telegram connections, channels, raw messages, signals.');

  for (const [key, provider] of Object.entries(providerMap)) {
    const u = userMap[key];
    if (!u) continue;

    const source = await insertOne(
      `INSERT INTO signal_sources (
         id, user_id, provider_id, source_type, name, status, created_at, updated_at
       ) VALUES ($1, $2, $3, 'telegram', $4, 'ACTIVE', NOW(), NOW())
       RETURNING id`,
      [uuid(), u.id, provider.id, `${provider.name} Telegram`],
    );

    const connection = await insertOne(
      `INSERT INTO telegram_connections (
         id, user_id, phone_number, session_encrypted, status, created_at, updated_at
       ) VALUES ($1, $2, '+2348000000001', $3, 'ACTIVE', NOW(), NOW())
       RETURNING id`,
      [uuid(), u.id, crypto.randomBytes(64).toString('hex')],
    );

    const channel = await insertOne(
      `INSERT INTO telegram_channels (
         id, connection_id, source_id, channel_id, channel_name, is_active, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, TRUE, NOW(), NOW())
       RETURNING id`,
      [uuid(), connection.id, source.id, `-1001${Date.now()}`, `${provider.name} VIP`],
    );

    // Raw messages
    const messages = [
      { text: 'XAUUSD BUY @ 3350 SL 3340 TP 3370', classification: 'NEW_TRADE' },
      { text: 'EURUSD LONG 1.0850 Stop 1.0820 Target 1.0920', classification: 'NEW_TRADE' },
      { text: 'Secure profit on gold', classification: 'TRADE_MANAGEMENT' },
      { text: 'Good morning traders!', classification: 'CONVERSATION' },
      { text: 'Close half of EURUSD', classification: 'TRADE_MANAGEMENT' },
    ];

    for (const m of messages) {
      const raw = await insertOne(
        `INSERT INTO source_messages (
           id, source_id, channel_id, external_message_id, sender, message_text,
           processing_status, classification, created_at, updated_at
         ) VALUES ($1, $2, $3, $4, $5, $6, 'PROCESSED', $7, $8, NOW())
         RETURNING id`,
        [
          uuid(), source.id, channel.id,
          `msg_${Date.now()}_${Math.floor(Math.random() * 9999)}`,
          provider.name, m.text, m.classification,
          hoursAgo(Math.floor(Math.random() * 48)),
        ],
      );

      if (m.classification === 'NEW_TRADE') {
        const signal = await insertOne(
          `INSERT INTO signals (
             id, source_id, source_message_id, provider_id, symbol, direction,
             entry_price, stop_loss, take_profit, confidence, status, created_at, updated_at
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'VALIDATED', $11, NOW())
           RETURNING id`,
          [
            uuid(), source.id, raw.id, provider.id,
            m.text.includes('XAUUSD') ? 'XAUUSD' : 'EURUSD',
            'BUY',
            m.text.includes('XAUUSD') ? 3350 : 1.0850,
            m.text.includes('XAUUSD') ? 3340 : 1.0820,
            m.text.includes('XAUUSD') ? 3370 : 1.0920,
            0.92,
            hoursAgo(Math.floor(Math.random() * 24)),
          ],
        );

        await safeExec(
          `INSERT INTO signal_parses (
             id, signal_id, parser_type, confidence_score, latency_ms, created_at
           ) VALUES ($1, $2, 'FAST_PATH', 0.92, 45, NOW())`,
          [uuid(), signal.id],
        );
      }
    }

    // DNA
    await safeExec(
      `INSERT INTO provider_dna (id, provider_id, language, confidence, created_at, updated_at)
       VALUES ($1, $2, 'en', 0.91, NOW(), NOW())
       ON CONFLICT (provider_id) DO NOTHING`,
      [uuid(), provider.id],
    );
  }
}

// ---------------------------------------------------------------------
// Trading (brokers, accounts, trades, events)
// ---------------------------------------------------------------------

async function seedTrading(userMap, brokerMap, providerMap) {
  log('Seeding broker accounts, trades, events, risk profiles, automation rules.');

  const trader1 = userMap.trader1;
  const trader2 = userMap.trader2;
  if (!trader1) return;

  const account = await insertOne(
    `INSERT INTO broker_accounts (
       id, user_id, broker_id, account_number_encrypted, server, platform,
       account_type, metaapi_account_id, balance, equity, status, created_at, updated_at
     ) VALUES ($1, $2, $3, $4, 'Exness-MT5Real', 'MT5', 'demo', $5, 10000, 10250, 'CONNECTED', NOW(), NOW())
     RETURNING id`,
    [uuid(), trader1.id, brokerMap.EXNESS.id, crypto.randomBytes(16).toString('hex'), `metaapi_${uuid()}`],
  );

  if (trader2) {
    await safeExec(
      `INSERT INTO broker_accounts (
         id, user_id, broker_id, account_number_encrypted, server, platform,
         account_type, metaapi_account_id, balance, equity, status, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, 'XM-MT5Real', 'MT5', 'live', $5, 5000, 4980, 'CONNECTED', NOW(), NOW())`,
      [uuid(), trader2.id, brokerMap.XM.id, crypto.randomBytes(16).toString('hex'), `metaapi_${uuid()}`],
    );
  }

  // Risk profile
  await safeExec(
    `INSERT INTO risk_profiles (
       id, user_id, risk_percent, max_daily_loss, max_drawdown, max_open_trades,
       created_at, updated_at
     ) VALUES ($1, $2, 1.0, 500, 0.20, 10, NOW(), NOW())
     ON CONFLICT (user_id) DO NOTHING`,
    [uuid(), trader1.id],
  );

  // Automation rules
  const rules = [
    { name: 'Take profit at 1:1', condition: { field: 'profit_r', op: '>=', value: 1 }, action: { type: 'MOVE_SL_BREAKEVEN' } },
    { name: 'Trail after 30 pips', condition: { field: 'profit_pips', op: '>=', value: 30 }, action: { type: 'TRAILING_STOP', distancePips: 20 } },
    { name: 'Emergency stop on drawdown', condition: { field: 'daily_drawdown_pct', op: '>=', value: 5 }, action: { type: 'CLOSE_ALL' } },
  ];
  for (const r of rules) {
    await safeExec(
      `INSERT INTO automation_rules (
         id, user_id, name, condition, action, enabled, priority, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, TRUE, 10, NOW(), NOW())`,
      [uuid(), trader1.id, r.name, JSON.stringify(r.condition), JSON.stringify(r.action)],
    );
  }

  // Trades + events
  const provider1 = providerMap.provider1;
  const symbols = [
    { symbol: 'XAUUSD', entry: 3350, exit: 3370, sl: 3340, tp: 3370, win: true },
    { symbol: 'EURUSD', entry: 1.0850, exit: 1.0820, sl: 1.0820, tp: 1.0920, win: false },
    { symbol: 'XAUUSD', entry: 3340, exit: 3365, sl: 3330, tp: 3365, win: true },
    { symbol: 'GBPUSD', entry: 1.2700, exit: 1.2780, sl: 1.2660, tp: 1.2780, win: true },
    { symbol: 'USDJPY', entry: 152.00, exit: 151.40, sl: 152.40, tp: 151.40, win: true },
  ];

  for (let i = 0; i < symbols.length; i += 1) {
    const s = symbols[i];
    const opened = daysAgo(10 - i);
    const closed = daysAgo(10 - i - 1);
    const volume = 0.10;
    const pnl = s.win ? (s.symbol === 'XAUUSD' ? 200 : 100) : -100;

    const trade = await insertOne(
      `INSERT INTO trades (
         id, user_id, broker_account_id, provider_id, symbol, direction, volume,
         entry_price, exit_price, stop_loss, take_profit, realized_profit,
         status, opened_at, closed_at, opened_by, closed_by, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, 'BUY', $6, $7, $8, $9, $10, $11,
         'CLOSED', $12, $13, 'PROVIDER', 'PROVIDER', NOW(), NOW())
       RETURNING id`,
      [
        uuid(), trader1.id, account.id, provider1 ? provider1.id : null,
        s.symbol, volume, s.entry, s.exit, s.sl, s.tp, pnl,
        opened, closed,
      ],
    );

    const events = [
      'SIGNAL_RECEIVED', 'PARSED', 'EXECUTION_REQUESTED', 'EXECUTED',
      'SL_MODIFIED', 'BREAK_EVEN', 'CLOSED', 'ARCHIVED',
    ];
    for (const eventType of events) {
      await safeExec(
        `INSERT INTO trade_events (
           id, trade_id, event_type, actor, metadata, created_at
         ) VALUES ($1, $2, $3, 'SYSTEM', '{}', $4)`,
        [uuid(), trade.id, eventType, opened],
      );
    }
  }
}

// ---------------------------------------------------------------------
// Solana (wallets, blinks, proof-of-alpha, leaderboard)
// ---------------------------------------------------------------------

async function seedSolana(userMap, providerMap) {
  log('Seeding Solana wallets, blinks, proof-of-alpha, leaderboard.');

  const trader1 = userMap.trader1;
  const provider1 = providerMap.provider1;

  if (trader1) {
    await safeExec(
      `INSERT INTO solana_wallets (
         id, user_id, wallet_address, is_primary, verified_at, created_at, updated_at
       ) VALUES ($1, $2, $3, TRUE, NOW(), NOW(), NOW())`,
      [uuid(), trader1.id, '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'],
    );
  }

  if (provider1) {
    const blink = await insertOne(
      `INSERT INTO solana_blinks (
         id, provider_id, owner_user_id, template_type, status,
         title, description, label, token_symbol, token_mint,
         amount, amount_decimals, network, metadata, created_at, updated_at
       ) VALUES ($1, $2, $3, 'subscribe', 'active',
         'Subscribe to FX Ninja', 'Get premium signals', 'Subscribe',
         'USDC', 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
         19.00, 6, 'devnet', '{}', NOW(), NOW())
       RETURNING id`,
      [uuid(), provider1.id, provider1.user_id],
    );

    for (let i = 0; i < 5; i += 1) {
      await safeExec(
        `INSERT INTO solana_blink_shares (
           id, blink_id, channel, shared_by_user_id, created_at
         ) VALUES ($1, $2, 'x', $3, NOW())`,
        [uuid(), blink.id, provider1.user_id],
      );
    }

    for (let i = 0; i < 3; i += 1) {
      await safeExec(
        `INSERT INTO solana_blink_conversions (
           id, blink_id, wallet, token_symbol, token_mint, amount, signature,
           reference, status, created_at, updated_at
         ) VALUES ($1, $2, $3, 'USDC', 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
           19.00, $4, $5, 'confirmed', NOW(), NOW())`,
        [uuid(), blink.id, '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
          crypto.randomBytes(64).toString('hex'), crypto.randomBytes(32).toString('hex')],
      );
    }
  }

  // Proof-of-Alpha
  if (provider1) {
    for (let i = 0; i < 5; i += 1) {
      const proof = await insertOne(
        `INSERT INTO solana_proof_records (
           id, provider_id, trade_id, kind, status, verification_level,
           memo_version, memo_payload, memo_hash, memo_bytes, signature,
           block_slot, block_time, confirmed_at, created_at, updated_at
         ) VALUES ($1, $2, $3, 'trade_closed', 'confirmed', 'on_chain_confirmed',
           1, $4, $5, 120, $6, 100000000 + $7, $8, NOW(), NOW(), NOW())
         RETURNING id`,
        [
          uuid(), provider1.id, null,
          JSON.stringify({ v: 1, k: 'trade_closed', p: provider1.id, r: 2.5 }),
          crypto.randomBytes(32).toString('hex'),
          crypto.randomBytes(64).toString('hex'),
          i, daysAgo(i),
        ],
      );

      await safeExec(
        `INSERT INTO solana_proof_verifications (
           id, proof_id, signature, provider_id, level, valid, matches, created_at
         ) VALUES ($1, $2, $3, $4, 'on_chain_confirmed', TRUE, TRUE, NOW())`,
        [uuid(), proof.id, crypto.randomBytes(64).toString('hex'), provider1.id],
      );
    }
  }

  // Leaderboard cache
  for (let i = 0; i < 5; i += 1) {
    await safeExec(
      `INSERT INTO solana_leaderboard_cache (
         id, window, sort_by, rank, provider_id, provider_name,
         total_trades, winning_trades, losing_trades, win_rate, total_pnl_usd,
         average_pnl_percent, profit_factor, verified_trades, verification_level,
         created_at
       ) VALUES ($1, 'month', 'total_pnl', $2, $3, $4, 120, 85, 35, 70.8, $5, 2.4, 2.3, 80, 'on_chain_confirmed', NOW())`,
      [
        uuid(), i + 1,
        providerMap.provider1 ? providerMap.provider1.id : uuid(),
        providerMap.provider1 ? providerMap.provider1.name : `Provider ${i + 1}`,
        3500 - i * 400,
      ],
    );
  }
}

// ---------------------------------------------------------------------
// Crypto trading
// ---------------------------------------------------------------------

async function seedCryptoTrading(userMap) {
  log('Seeding crypto positions, orders, execution routes, market data.');
  const trader1 = userMap.trader1;
  if (!trader1) return;

  const pairs = [
    ['BTC/USDT', 'BTC', 'USDT', 67000, 68000, 0.01],
    ['ETH/USDT', 'ETH', 'USDT', 3200, 3250, 0.5],
    ['SOL/USDC', 'SOL', 'USDC', 145, 150, 3],
  ];

  for (let i = 0; i < pairs.length; i += 1) {
    const [canonical, base, quote, entry, mark, size] = pairs[i];
    const position = await insertOne(
      `INSERT INTO crypto_positions (
         id, user_id, symbol, side, size, entry_price, mark_price,
         leverage, margin_used, unrealized_pnl, status, opened_at, created_at, updated_at
       ) VALUES ($1, $2, $3, 'LONG', $4, $5, $6, 1, $7, $8, 'open', $9, NOW(), NOW())
       RETURNING id`,
      [
        uuid(), trader1.id, canonical, size, entry, mark,
        entry * size, (mark - entry) * size,
        daysAgo(3),
      ],
    );

    await safeExec(
      `INSERT INTO crypto_position_events (
         id, position_id, event_type, actor, metadata, created_at
       ) VALUES ($1, $2, 'OPENED', 'SYSTEM', '{}', NOW())`,
      [uuid(), position.id],
    );

    void base;
    void quote;
  }

  // Execution routes
  for (let i = 0; i < 6; i += 1) {
    await safeExec(
      `INSERT INTO execution_routes (
         id, user_id, symbol, instrument_class, order_type, direction,
         resolved_gateway, status, reason, policy_mode, attempt, latency_ms,
         created_at
       ) VALUES ($1, $2, $3, 'crypto_spot', 'market', 'BUY', 'jupiter', 'resolved', 'symbol_class', 'auto', 1, 45, NOW())`,
      [
        uuid(), trader1.id,
        i % 2 === 0 ? 'BTC/USDT' : 'ETH/USDC',
      ],
    );
  }

  // Execution route policies
  await safeExec(
    `INSERT INTO execution_route_policies (
       id, user_id, name, mode, fallback_behavior, is_default, created_at, updated_at
     ) VALUES ($1, $2, 'default', 'auto', 'retry_next', TRUE, NOW(), NOW())
     ON CONFLICT DO NOTHING`,
    [uuid(), trader1.id],
  );
}

// ---------------------------------------------------------------------
// Marketplace, reviews, traders, affiliates
// ---------------------------------------------------------------------

async function seedMarketplace(userMap, providerMap) {
  log('Seeding marketplace listings, traders, reviews, affiliates.');

  for (const [key, provider] of Object.entries(providerMap)) {
    await safeExec(
      `INSERT INTO marketplace_listings (
         id, provider_id, title, description, category, status, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, 'forex', 'ACTIVE', NOW(), NOW())`,
      [
        uuid(), provider.id,
        `${provider.name} Signals`,
        `${provider.name} provides AI-processed trading signals.`,
      ],
    );

    for (let i = 0; i < 3; i += 1) {
      await safeExec(
        `INSERT INTO reviews (
           id, reviewer_id, provider_id, rating, title, body, status, created_at, updated_at
         ) VALUES ($1, $2, $3, 5, 'Excellent signals', 'Consistent and clear.', 'PUBLISHED', NOW(), NOW())`,
        [
          uuid(),
          userMap.trader1 ? userMap.trader1.id : null,
          provider.id,
        ],
      );
    }
  }

  // Trader profiles
  for (const key of ['trader1', 'trader2']) {
    const u = userMap[key];
    if (!u) continue;
    await safeExec(
      `INSERT INTO trader_profiles (
         id, user_id, display_name, bio, status, created_at, updated_at
       ) VALUES ($1, $2, $3, 'Seed trader profile', 'ACTIVE', NOW(), NOW())
       ON CONFLICT (user_id) DO NOTHING`,
      [uuid(), u.id, u.first],
    );
  }

  // Trading styles reference
  const styles = ['Scalper', 'Day Trader', 'Swing Trader', 'Position Trader', 'News Trader', 'Grid Bot'];
  for (const style of styles) {
    await safeExec(
      `INSERT INTO trading_styles (id, name, created_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (name) DO NOTHING`,
      [uuid(), style],
    );
  }

  // Affiliate partner
  await safeExec(
    `INSERT INTO affiliate_partners (
       id, user_id, code, status, commission_rate, created_at, updated_at
     ) VALUES ($1, $2, $3, 'ACTIVE', 0.10, NOW(), NOW())
     ON CONFLICT (code) DO NOTHING`,
    [
      uuid(),
      userMap.trader1 ? userMap.trader1.id : null,
      'AFF' + crypto.randomBytes(4).toString('hex').toUpperCase(),
    ],
  );

  // Notifications for trader1
  if (userMap.trader1) {
    const notifications = [
      ['TRADE', 'Trade opened', 'Your XAUUSD trade was executed.'],
      ['KYC', 'KYC approved', 'Your identity has been verified.'],
      ['PAYMENT', 'Subscription renewed', 'Your monthly plan renewed successfully.'],
      ['REFERRAL', 'Referral reward', 'You earned $3.00 from a referral.'],
      ['SECURITY', 'New device login', 'A new device signed in to your account.'],
    ];
    for (const [type, title, body] of notifications) {
      await safeExec(
        `INSERT INTO notifications (
           id, user_id, type, title, body, is_read, created_at
         ) VALUES ($1, $2, $3, $4, $5, FALSE, NOW())`,
        [uuid(), userMap.trader1.id, type, title, body],
      );
    }
  }
}

// ---------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------

async function main() {
  const start = Date.now();
  log('SignalForge seed starting.');

  if (RESET) {
    await resetAll();
  }

  const roleMap = await seedRoles();
  const planMap = await seedPlans();
  const docTypes = await seedKycDocumentTypes();
  const brokerMap = await seedBrokers();
  await seedSystemSettings();
  await seedCryptoReference();

  const userMap = await seedUsersAndKyc(roleMap, docTypes);
  await seedCommerce(userMap, planMap);
  await seedReferrals(userMap);

  const providerMap = await seedProviders(userMap);
  await seedSignalSources(userMap, providerMap);
  await seedTrading(userMap, brokerMap, providerMap);
  await seedSolana(userMap, providerMap);
  await seedCryptoTrading(userMap);
  await seedMarketplace(userMap, providerMap);

  const elapsed = ((Date.now() - start) / 1000).toFixed(2);
  log(`Seed complete in ${elapsed}s.`);
  log('');
  log('Login credentials (password for every user: TestPassword1)');
  log('  superadmin@signalforge.local   (SUPER_ADMIN)');
  log('  admin@signalforge.local        (ADMIN)');
  log('  compliance@signalforge.local   (COMPLIANCE_OFFICER)');
  log('  finance@signalforge.local      (FINANCE_ADMIN)');
  log('  support@signalforge.local      (SUPPORT)');
  log('  provider@signalforge.local     (PROVIDER, KYC verified)');
  log('  provider2@signalforge.local    (PROVIDER, KYC verified)');
  log('  trader1@signalforge.local      (USER, KYC verified)');
  log('  trader2@signalforge.local      (USER, KYC pending)');
  log('  trader3@signalforge.local      (USER, KYC rejected)');
  log('  trader4@signalforge.local      (USER, KYC not started)');
  log('  test@signalforge.local         (USER, existing test account)');

  await pool.end();
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('[seed] Failed:', error);
  process.exit(1);
});