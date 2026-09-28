'use strict';

const { PERMISSIONS, ROLES } = require('./rbac.constants');

/**
 * SignalForge - Permission Registry
 *
 * Human-readable metadata for each permission. Admin and compliance
 * consoles use this metadata to render permission tables and to
 * group permissions by domain.
 */

const PERMISSION_METADATA = Object.freeze({
  [PERMISSIONS.USERS_READ]: {
    label: 'View users',
    domain: 'Users',
    description: 'Read user accounts and basic profile information.',
  },
  [PERMISSIONS.USERS_UPDATE]: {
    label: 'Update users',
    domain: 'Users',
    description: 'Update user profiles and preferences.',
  },
  [PERMISSIONS.USERS_MANAGE]: {
    label: 'Manage users',
    domain: 'Users',
    description: 'Suspend, restrict, or delete user accounts.',
  },
  [PERMISSIONS.KYC_REVIEW]: {
    label: 'Review KYC',
    domain: 'Compliance',
    description: 'Review KYC submissions and request resubmission.',
  },
  [PERMISSIONS.KYC_APPROVE]: {
    label: 'Approve KYC',
    domain: 'Compliance',
    description: 'Approve or reject KYC submissions.',
  },
  [PERMISSIONS.PAYMENTS_VIEW]: {
    label: 'View payments',
    domain: 'Finance',
    description: 'Read payment, subscription, and wallet data.',
  },
  [PERMISSIONS.PAYMENTS_MANAGE]: {
    label: 'Manage payments',
    domain: 'Finance',
    description: 'Process refunds, resolve disputes, and adjust billing.',
  },
  [PERMISSIONS.REFERRALS_SETTLE]: {
    label: 'Settle referrals',
    domain: 'Finance',
    description: 'Run monthly referral settlement and manage rewards.',
  },
  [PERMISSIONS.PROVIDERS_APPROVE]: {
    label: 'Approve providers',
    domain: 'Marketplace',
    description: 'Approve or suspend provider listings.',
  },
  [PERMISSIONS.SIGNALS_MONITOR]: {
    label: 'Monitor signals',
    domain: 'Signals',
    description: 'View live signal and AI processing activity.',
  },
  [PERMISSIONS.TRADES_VIEW]: {
    label: 'View trades',
    domain: 'Trading',
    description: 'View live and historical trades across users.',
  },
  [PERMISSIONS.SYSTEM_CONFIGURE]: {
    label: 'Configure system',
    domain: 'System',
    description: 'Change platform-wide settings and feature flags.',
  },
  [PERMISSIONS.AUDIT_LOGS_VIEW]: {
    label: 'View audit logs',
    domain: 'Security',
    description: 'Read the immutable audit log.',
  },

  // Feature A.
  [PERMISSIONS.BLINKS_CREATE]: {
    label: 'Create blinks',
    domain: 'Solana Actions',
    description: 'Create Solana Blink payment links for plans and referrals.',
  },
  [PERMISSIONS.BLINKS_VIEW]: {
    label: 'View blinks',
    domain: 'Solana Actions',
    description: 'View Blinks the user has access to.',
  },
  [PERMISSIONS.BLINKS_MANAGE]: {
    label: 'Manage blinks',
    domain: 'Solana Actions',
    description: 'Pause, resume, or archive Blinks.',
  },
  [PERMISSIONS.BLINKS_VIEW_ANALYTICS]: {
    label: 'View blink analytics',
    domain: 'Solana Actions',
    description: 'Read Blink conversion and revenue analytics.',
  },
  [PERMISSIONS.BLINKS_APPROVE]: {
    label: 'Approve blinks',
    domain: 'Solana Actions',
    description: 'Approve Blinks for public listing.',
  },

  // Feature B.
  [PERMISSIONS.PROOF_OF_ALPHA_VIEW]: {
    label: 'View proof of alpha',
    domain: 'Proof of Alpha',
    description: 'Read on-chain proof records.',
  },
  [PERMISSIONS.PROOF_OF_ALPHA_WRITE]: {
    label: 'Write proof of alpha',
    domain: 'Proof of Alpha',
    description: 'Write proof memos to the Solana Memo program.',
  },
  [PERMISSIONS.PROOF_OF_ALPHA_VERIFY]: {
    label: 'Verify proof of alpha',
    domain: 'Proof of Alpha',
    description: 'Verify proofs against the on-chain record.',
  },
  [PERMISSIONS.LEADERBOARD_VIEW]: {
    label: 'View leaderboard',
    domain: 'Proof of Alpha',
    description: 'Read the on-chain-verified provider leaderboard.',
  },
  [PERMISSIONS.LEADERBOARD_MANAGE]: {
    label: 'Manage leaderboard',
    domain: 'Proof of Alpha',
    description: 'Trigger leaderboard refreshes and cache clears.',
  },

  // Feature C.
  [PERMISSIONS.CRYPTO_TRADING_ENABLE]: {
    label: 'Enable crypto trading',
    domain: 'Crypto Trading',
    description: 'Enable crypto trading for the user account.',
  },
  [PERMISSIONS.CRYPTO_TRADING_VIEW]: {
    label: 'View crypto trading',
    domain: 'Crypto Trading',
    description: 'Read crypto positions, orders, and history.',
  },
  [PERMISSIONS.CRYPTO_TRADING_CONFIGURE]: {
    label: 'Configure crypto trading',
    domain: 'Crypto Trading',
    description: 'Update crypto risk and automation settings.',
  },
  [PERMISSIONS.DEX_ROUTING_VIEW]: {
    label: 'View DEX routing',
    domain: 'Crypto Trading',
    description: 'Read routing decisions and policy history.',
  },
  [PERMISSIONS.DEX_ROUTING_CONFIGURE]: {
    label: 'Configure DEX routing',
    domain: 'Crypto Trading',
    description: 'Update routing policies and preferred gateways.',
  },
  [PERMISSIONS.MARKET_DATA_VIEW]: {
    label: 'View market data',
    domain: 'Market Data',
    description: 'Read prices, liquidity, volume, pools, and tokens.',
  },
  [PERMISSIONS.MARKET_DATA_MANAGE]: {
    label: 'Manage market data',
    domain: 'Market Data',
    description: 'Trigger market data syncs and manage registries.',
  },
});

function describePermission(permission) {
  return PERMISSION_METADATA[permission] || null;
}

function listPermissionsByDomain() {
  const grouped = {};
  for (const [permission, meta] of Object.entries(PERMISSION_METADATA)) {
    if (!grouped[meta.domain]) {
      grouped[meta.domain] = [];
    }
    grouped[meta.domain].push({ permission, ...meta });
  }
  return grouped;
}

function listAllPermissions() {
  return Object.entries(PERMISSION_METADATA).map(([permission, meta]) => ({
    permission,
    ...meta,
  }));
}

function listPermissionsForRole(role) {
  const { resolvePermissionsForRole } = require('./rbac.constants');
  const permissions = resolvePermissionsForRole(role);
  return permissions.map((permission) => ({
    permission,
    ...(PERMISSION_METADATA[permission] || {}),
  }));
}

function listRoles() {
  return Object.values(ROLES);
}

module.exports = {
  PERMISSION_METADATA,
  describePermission,
  listPermissionsByDomain,
  listAllPermissions,
  listPermissionsForRole,
  listRoles,
};