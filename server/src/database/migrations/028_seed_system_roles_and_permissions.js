'use strict';

/**
 * Migration 028 - System Roles and Permissions
 *
 * Ensures the platform's canonical roles and permissions exist.
 * Roles and permissions are reference data, not user data; they are
 * required for the platform to function and are inserted idempotently
 * so this migration can be re-run safely.
 *
 * Idempotent: uses ON CONFLICT DO NOTHING for every insert.
 *
 * @module server/database/migrations/028_seed_system_roles_and_permissions
 */

const ROLES = [
  { name: 'USER', description: 'Standard platform user' },
  { name: 'PROVIDER', description: 'Signal provider with a marketplace listing' },
  { name: 'TRADER', description: 'Manual trader followed via copy trading' },
  { name: 'MODERATOR', description: 'Marketplace and content moderator' },
  { name: 'COMPLIANCE_OFFICER', description: 'KYC and compliance reviewer' },
  { name: 'FINANCE_ADMIN', description: 'Billing, payments, and payouts administrator' },
  { name: 'SUPPORT', description: 'Customer support agent' },
  { name: 'ADMIN', description: 'Platform administrator' },
  { name: 'SUPER_ADMIN', description: 'Unrestricted platform owner' },
];

const PERMISSIONS = [
  // Users
  { name: 'users.read', description: 'View user accounts and profiles' },
  { name: 'users.update', description: 'Update user profiles and preferences' },
  { name: 'users.manage', description: 'Suspend, restrict, or delete user accounts' },

  // Compliance
  { name: 'kyc.review', description: 'Review KYC submissions' },
  { name: 'kyc.approve', description: 'Approve or reject KYC submissions' },

  // Finance
  { name: 'payments.view', description: 'View payment and subscription data' },
  { name: 'payments.manage', description: 'Process refunds and resolve disputes' },
  { name: 'referrals.settle', description: 'Run monthly referral settlement' },

  // Marketplace
  { name: 'providers.approve', description: 'Approve or suspend provider listings' },

  // Signals and trading
  { name: 'signals.monitor', description: 'View live signal and AI processing activity' },
  { name: 'trades.view', description: 'View live and historical trades across users' },

  // System
  { name: 'system.configure', description: 'Change platform-wide settings' },
  { name: 'audit.logs.view', description: 'Read the immutable audit log' },

  // Solana Actions
  { name: 'blinks.create', description: 'Create Solana Blink payment links' },
  { name: 'blinks.view', description: 'View Blinks' },
  { name: 'blinks.manage', description: 'Pause, resume, or archive Blinks' },
  { name: 'blinks.view_analytics', description: 'Read Blink analytics' },
  { name: 'blinks.approve', description: 'Approve Blinks for public listing' },

  // Proof of Alpha
  { name: 'proof_of_alpha.view', description: 'Read on-chain proof records' },
  { name: 'proof_of_alpha.write', description: 'Write proof memos to Solana' },
  { name: 'proof_of_alpha.verify', description: 'Verify proofs against the on-chain record' },
  { name: 'leaderboard.view', description: 'Read the on-chain leaderboard' },
  { name: 'leaderboard.manage', description: 'Trigger leaderboard refreshes' },

  // Crypto trading
  { name: 'crypto_trading.enable', description: 'Enable crypto trading' },
  { name: 'crypto_trading.view', description: 'Read crypto positions and orders' },
  { name: 'crypto_trading.configure', description: 'Update crypto trading settings' },
  { name: 'dex_routing.view', description: 'Read routing decisions' },
  { name: 'dex_routing.configure', description: 'Update routing policies' },
  { name: 'market_data.view', description: 'Read market data' },
  { name: 'market_data.manage', description: 'Trigger market data syncs' },
];

const ROLE_PERMISSIONS = {
  USER: [
    'users.read',
    'blinks.view',
    'proof_of_alpha.view',
    'leaderboard.view',
    'crypto_trading.enable',
    'crypto_trading.view',
    'market_data.view',
  ],
  PROVIDER: [
    'users.read',
    'blinks.create',
    'blinks.view',
    'blinks.view_analytics',
    'proof_of_alpha.view',
    'leaderboard.view',
    'crypto_trading.enable',
    'crypto_trading.view',
    'market_data.view',
  ],
  TRADER: [
    'users.read',
    'blinks.view',
    'proof_of_alpha.view',
    'leaderboard.view',
    'crypto_trading.enable',
    'crypto_trading.view',
    'market_data.view',
  ],
  MODERATOR: [
    'users.read',
    'blinks.view',
    'blinks.manage',
    'proof_of_alpha.view',
    'leaderboard.view',
    'leaderboard.manage',
    'market_data.view',
  ],
  COMPLIANCE_OFFICER: [
    'users.read',
    'kyc.review',
    'kyc.approve',
    'blinks.view',
    'proof_of_alpha.view',
    'leaderboard.view',
  ],
  FINANCE_ADMIN: [
    'users.read',
    'payments.view',
    'payments.manage',
    'referrals.settle',
    'blinks.view',
    'blinks.view_analytics',
    'proof_of_alpha.view',
    'leaderboard.view',
  ],
  SUPPORT: [
    'users.read',
    'users.update',
    'blinks.view',
    'proof_of_alpha.view',
    'leaderboard.view',
    'market_data.view',
  ],
  ADMIN: [
    'users.read',
    'users.update',
    'users.manage',
    'kyc.review',
    'kyc.approve',
    'payments.view',
    'payments.manage',
    'referrals.settle',
    'providers.approve',
    'signals.monitor',
    'trades.view',
    'audit.logs.view',
    'blinks.create',
    'blinks.view',
    'blinks.manage',
    'blinks.view_analytics',
    'blinks.approve',
    'proof_of_alpha.view',
    'proof_of_alpha.write',
    'proof_of_alpha.verify',
    'leaderboard.view',
    'leaderboard.manage',
    'crypto_trading.enable',
    'crypto_trading.view',
    'crypto_trading.configure',
    'dex_routing.view',
    'dex_routing.configure',
    'market_data.view',
    'market_data.manage',
  ],
  SUPER_ADMIN: [
    'users.read',
    'users.update',
    'users.manage',
    'kyc.review',
    'kyc.approve',
    'payments.view',
    'payments.manage',
    'referrals.settle',
    'providers.approve',
    'signals.monitor',
    'trades.view',
    'system.configure',
    'audit.logs.view',
    'blinks.create',
    'blinks.view',
    'blinks.manage',
    'blinks.view_analytics',
    'blinks.approve',
    'proof_of_alpha.view',
    'proof_of_alpha.write',
    'proof_of_alpha.verify',
    'leaderboard.view',
    'leaderboard.manage',
    'crypto_trading.enable',
    'crypto_trading.view',
    'crypto_trading.configure',
    'dex_routing.view',
    'dex_routing.configure',
    'market_data.view',
    'market_data.manage',
  ],
};

async function up(client) {
  // Insert roles
  for (const role of ROLES) {
    await client.query(
      `INSERT INTO roles (name, description)
       VALUES ($1, $2)
       ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description`,
      [role.name, role.description],
    );
  }

  // Insert permissions
  for (const permission of PERMISSIONS) {
    await client.query(
      `INSERT INTO permissions (name, description)
       VALUES ($1, $2)
       ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description`,
      [permission.name, permission.description],
    );
  }

  // Map roles to permissions
  for (const [roleName, permissionNames] of Object.entries(ROLE_PERMISSIONS)) {
    for (const permissionName of permissionNames) {
      await client.query(
        `INSERT INTO role_permissions (role_id, permission_id)
         SELECT r.id, p.id
           FROM roles r, permissions p
          WHERE r.name = $1
            AND p.name = $2
         ON CONFLICT (role_id, permission_id) DO NOTHING`,
        [roleName, permissionName],
      );
    }
  }
}

async function down(client) {
  // Remove role-permission mappings we inserted. Do not delete the
  // roles and permissions themselves: they may be referenced by user
  // records or by other migrations.
  for (const [roleName, permissionNames] of Object.entries(ROLE_PERMISSIONS)) {
    for (const permissionName of permissionNames) {
      await client.query(
        `DELETE FROM role_permissions
          WHERE role_id = (SELECT id FROM roles WHERE name = $1)
            AND permission_id = (SELECT id FROM permissions WHERE name = $2)`,
        [roleName, permissionName],
      );
    }
  }
}

module.exports.up = up;
module.exports.down = down;