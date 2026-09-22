/**
 * Permission Registry
 *
 * Central registry of all platform permissions and their grouping.
 * Used by the RBAC seeding and permission-checking logic.
 *
 * @module signalforge/server/modules/rbac/permission-registry
 */

import { PERMISSIONS, PERMISSION_GROUPS } from '@signalforge/shared/constants/permissions';

export const PERMISSION_DEFINITIONS = Object.freeze([
  // Users
  { name: PERMISSIONS.USERS_READ, group: 'users', description: 'View user accounts' },
  { name: PERMISSIONS.USERS_CREATE, group: 'users', description: 'Create user accounts' },
  { name: PERMISSIONS.USERS_UPDATE, group: 'users', description: 'Update user accounts' },
  { name: PERMISSIONS.USERS_DELETE, group: 'users', description: 'Delete user accounts' },
  { name: PERMISSIONS.USERS_SUSPEND, group: 'users', description: 'Suspend user accounts' },
  { name: PERMISSIONS.USERS_IMPERSONATE, group: 'users', description: 'Impersonate users' },

  // RBAC
  { name: PERMISSIONS.ROLES_READ, group: 'rbac', description: 'View roles' },
  { name: PERMISSIONS.ROLES_MANAGE, group: 'rbac', description: 'Manage roles' },
  { name: PERMISSIONS.PERMISSIONS_READ, group: 'rbac', description: 'View permissions' },
  { name: PERMISSIONS.PERMISSIONS_MANAGE, group: 'rbac', description: 'Manage permissions' },

  // KYC
  { name: PERMISSIONS.KYC_VIEW, group: 'kyc', description: 'View KYC applications' },
  { name: PERMISSIONS.KYC_REVIEW, group: 'kyc', description: 'Review KYC applications' },
  { name: PERMISSIONS.KYC_APPROVE, group: 'kyc', description: 'Approve KYC applications' },
  { name: PERMISSIONS.KYC_REJECT, group: 'kyc', description: 'Reject KYC applications' },
  { name: PERMISSIONS.KYC_RESUBMIT_REQUEST, group: 'kyc', description: 'Request KYC resubmission' },
  { name: PERMISSIONS.KYC_DOCUMENTS_VIEW, group: 'kyc', description: 'View KYC documents' },
  { name: PERMISSIONS.KYC_DOCUMENT_TYPES_MANAGE, group: 'kyc', description: 'Manage KYC document types' },

  // Signals
  { name: PERMISSIONS.SIGNALS_VIEW, group: 'signals', description: 'View signals' },
  { name: PERMISSIONS.SIGNALS_MONITOR, group: 'signals', description: 'Monitor signals' },
  { name: PERMISSIONS.SIGNALS_REPLAY, group: 'signals', description: 'Replay signals' },
  { name: PERMISSIONS.SIGNALS_REPROCESS, group: 'signals', description: 'Reprocess signals' },

  // Providers
  { name: PERMISSIONS.PROVIDERS_READ, group: 'providers', description: 'View providers' },
  { name: PERMISSIONS.PROVIDERS_CREATE, group: 'providers', description: 'Create providers' },
  { name: PERMISSIONS.PROVIDERS_APPROVE, group: 'providers', description: 'Approve providers' },
  { name: PERMISSIONS.PROVIDERS_SUSPEND, group: 'providers', description: 'Suspend providers' },
  { name: PERMISSIONS.PROVIDERS_MANAGE, group: 'providers', description: 'Manage providers' },
  { name: PERMISSIONS.PROVIDERS_CERTIFY, group: 'providers', description: 'Certify providers' },

  // Trades
  { name: PERMISSIONS.TRADES_VIEW, group: 'trades', description: 'View trades' },
  { name: PERMISSIONS.TRADES_VIEW_ALL, group: 'trades', description: 'View all trades' },
  { name: PERMISSIONS.TRADES_INTERVENE, group: 'trades', description: 'Intervene in trades' },
  { name: PERMISSIONS.TRADES_FORCE_CLOSE, group: 'trades', description: 'Force close trades' },

  // Brokers
  { name: PERMISSIONS.BROKERS_READ, group: 'brokers', description: 'View brokers' },
  { name: PERMISSIONS.BROKERS_MANAGE, group: 'brokers', description: 'Manage brokers' },
  { name: PERMISSIONS.BROKERS_ACCOUNTS_VIEW, group: 'brokers', description: 'View broker accounts' },
  { name: PERMISSIONS.BROKERS_ACCOUNTS_MANAGE, group: 'brokers', description: 'Manage broker accounts' },

  // Subscriptions
  { name: PERMISSIONS.SUBSCRIPTIONS_VIEW, group: 'subscriptions', description: 'View subscriptions' },
  { name: PERMISSIONS.SUBSCRIPTIONS_MANAGE, group: 'subscriptions', description: 'Manage subscriptions' },
  { name: PERMISSIONS.PLANS_MANAGE, group: 'subscriptions', description: 'Manage subscription plans' },

  // Payments
  { name: PERMISSIONS.PAYMENTS_VIEW, group: 'payments', description: 'View payments' },
  { name: PERMISSIONS.PAYMENTS_MANAGE, group: 'payments', description: 'Manage payments' },
  { name: PERMISSIONS.PAYMENTS_REFUND, group: 'payments', description: 'Refund payments' },

  // Withdrawals
  { name: PERMISSIONS.WITHDRAWALS_VIEW, group: 'withdrawals', description: 'View withdrawals' },
  { name: PERMISSIONS.WITHDRAWALS_APPROVE, group: 'withdrawals', description: 'Approve withdrawals' },
  { name: PERMISSIONS.WITHDRAWALS_REJECT, group: 'withdrawals', description: 'Reject withdrawals' },

  // Referrals
  { name: PERMISSIONS.REFERRALS_VIEW, group: 'referrals', description: 'View referrals' },
  { name: PERMISSIONS.REFERRALS_MANAGE, group: 'referrals', description: 'Manage referrals' },
  { name: PERMISSIONS.REFERRALS_SETTLE, group: 'referrals', description: 'Settle referral rewards' },
  { name: PERMISSIONS.REFERRALS_REVIEW, group: 'referrals', description: 'Review referral rewards' },

  // Marketplace
  { name: PERMISSIONS.MARKETPLACE_VIEW, group: 'marketplace', description: 'View marketplace' },
  { name: PERMISSIONS.MARKETPLACE_MODERATE, group: 'marketplace', description: 'Moderate marketplace' },
  { name: PERMISSIONS.MARKETPLACE_LISTINGS_MANAGE, group: 'marketplace', description: 'Manage marketplace listings' },

  // Affiliate
  { name: PERMISSIONS.AFFILIATE_VIEW, group: 'affiliate', description: 'View affiliate data' },
  { name: PERMISSIONS.AFFILIATE_MANAGE, group: 'affiliate', description: 'Manage affiliates' },

  // IB
  { name: PERMISSIONS.IB_VIEW, group: 'ib', description: 'View IB data' },
  { name: PERMISSIONS.IB_MANAGE, group: 'ib', description: 'Manage IB' },

  // White Label
  { name: PERMISSIONS.WHITE_LABEL_VIEW, group: 'white-label', description: 'View white label projects' },
  { name: PERMISSIONS.WHITE_LABEL_MANAGE, group: 'white-label', description: 'Manage white label projects' },

  // Notifications
  { name: PERMISSIONS.NOTIFICATIONS_VIEW, group: 'notifications', description: 'View notifications' },
  { name: PERMISSIONS.NOTIFICATIONS_MANAGE, group: 'notifications', description: 'Manage notifications' },

  // Admin
  { name: PERMISSIONS.ADMIN_DASHBOARD_VIEW, group: 'admin', description: 'View admin dashboard' },
  { name: PERMISSIONS.ADMIN_SETTINGS_MANAGE, group: 'admin', description: 'Manage system settings' },
  { name: PERMISSIONS.ADMIN_SYSTEM_VIEW, group: 'admin', description: 'View system health' },
  { name: PERMISSIONS.ADMIN_FRAUD_VIEW, group: 'admin', description: 'View fraud detection' },

  // Audit
  { name: PERMISSIONS.AUDIT_LOGS_VIEW, group: 'audit', description: 'View audit logs' },
  { name: PERMISSIONS.AUDIT_LOGS_EXPORT, group: 'audit', description: 'Export audit logs' },

  // Security
  { name: PERMISSIONS.SECURITY_CENTER_VIEW, group: 'security', description: 'View security center' },
  { name: PERMISSIONS.SECURITY_THREATS_MANAGE, group: 'security', description: 'Manage security threats' },
  { name: PERMISSIONS.SECURITY_API_KEYS_MANAGE, group: 'security', description: 'Manage API keys' },

  // Executive
  { name: PERMISSIONS.EXECUTIVE_DASHBOARD_VIEW, group: 'executive', description: 'View executive dashboard' },
  { name: PERMISSIONS.EXECUTIVE_FINANCIALS_VIEW, group: 'executive', description: 'View executive financials' },

  // Support
  { name: PERMISSIONS.SUPPORT_TICKETS_VIEW, group: 'support', description: 'View support tickets' },
  { name: PERMISSIONS.SUPPORT_TICKETS_MANAGE, group: 'support', description: 'Manage support tickets' },
  { name: PERMISSIONS.SUPPORT_KNOWLEDGE_BASE_MANAGE, group: 'support', description: 'Manage knowledge base' },

  // Solana
  { name: PERMISSIONS.SOLANA_WALLETS_VIEW, group: 'solana', description: 'View Solana wallets' },
  { name: PERMISSIONS.SOLANA_ATTESTATIONS_VIEW, group: 'solana', description: 'View Solana attestations' },
  { name: PERMISSIONS.SOLANA_ATTESTATIONS_MANAGE, group: 'solana', description: 'Manage Solana attestations' },
  { name: PERMISSIONS.SOLANA_PROVENANCE_VIEW, group: 'solana', description: 'View Solana provenance' },
  { name: PERMISSIONS.SOLANA_PAYMENTS_VIEW, group: 'solana', description: 'View Solana payments' },
  { name: PERMISSIONS.SOLANA_PAYMENTS_MANAGE, group: 'solana', description: 'Manage Solana payments' },
  { name: PERMISSIONS.SOLANA_PROGRAM_MANAGE, group: 'solana', description: 'Manage Solana program' },
]);

export const ROLE_PERMISSION_MAP = Object.freeze({
  USER: [
    PERMISSIONS.SIGNALS_VIEW,
  ],
  PROVIDER: [
    PERMISSIONS.SIGNALS_VIEW,
    PERMISSIONS.PROVIDERS_READ,
  ],
  TRADER: [
    PERMISSIONS.SIGNALS_VIEW,
    PERMISSIONS.TRADES_VIEW,
  ],
  MODERATOR: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.SIGNALS_VIEW,
    PERMISSIONS.SIGNALS_MONITOR,
    PERMISSIONS.TRADES_VIEW_ALL,
    PERMISSIONS.PROVIDERS_READ,
    PERMISSIONS.MARKETPLACE_VIEW,
    PERMISSIONS.MARKETPLACE_MODERATE,
  ],
  COMPLIANCE_OFFICER: [
    PERMISSIONS.KYC_VIEW,
    PERMISSIONS.KYC_REVIEW,
    PERMISSIONS.KYC_APPROVE,
    PERMISSIONS.KYC_REJECT,
    PERMISSIONS.KYC_RESUBMIT_REQUEST,
    PERMISSIONS.KYC_DOCUMENTS_VIEW,
    PERMISSIONS.AUDIT_LOGS_VIEW,
    PERMISSIONS.REFERRALS_REVIEW,
  ],
  FINANCE_ADMIN: [
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.PAYMENTS_MANAGE,
    PERMISSIONS.PAYMENTS_REFUND,
    PERMISSIONS.WITHDRAWALS_VIEW,
    PERMISSIONS.WITHDRAWALS_APPROVE,
    PERMISSIONS.WITHDRAWALS_REJECT,
    PERMISSIONS.SUBSCRIPTIONS_VIEW,
    PERMISSIONS.SUBSCRIPTIONS_MANAGE,
    PERMISSIONS.REFERRALS_VIEW,
    PERMISSIONS.REFERRALS_SETTLE,
  ],
  SUPPORT: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.SUPPORT_TICKETS_VIEW,
    PERMISSIONS.SUPPORT_TICKETS_MANAGE,
    PERMISSIONS.SUPPORT_KNOWLEDGE_BASE_MANAGE,
    PERMISSIONS.KYC_VIEW,
  ],
  ADMIN: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.USERS_SUSPEND,
    PERMISSIONS.ROLES_READ,
    PERMISSIONS.PERMISSIONS_READ,
    PERMISSIONS.KYC_VIEW,
    PERMISSIONS.SIGNALS_VIEW,
    PERMISSIONS.SIGNALS_MONITOR,
    PERMISSIONS.SIGNALS_REPLAY,
    PERMISSIONS.PROVIDERS_READ,
    PERMISSIONS.PROVIDERS_APPROVE,
    PERMISSIONS.PROVIDERS_SUSPEND,
    PERMISSIONS.PROVIDERS_MANAGE,
    PERMISSIONS.TRADES_VIEW,
    PERMISSIONS.TRADES_VIEW_ALL,
    PERMISSIONS.BROKERS_READ,
    PERMISSIONS.BROKERS_MANAGE,
    PERMISSIONS.SUBSCRIPTIONS_VIEW,
    PERMISSIONS.SUBSCRIPTIONS_MANAGE,
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.WITHDRAWALS_VIEW,
    PERMISSIONS.REFERRALS_VIEW,
    PERMISSIONS.MARKETPLACE_VIEW,
    PERMISSIONS.MARKETPLACE_MODERATE,
    PERMISSIONS.NOTIFICATIONS_VIEW,
    PERMISSIONS.NOTIFICATIONS_MANAGE,
    PERMISSIONS.ADMIN_DASHBOARD_VIEW,
    PERMISSIONS.ADMIN_SYSTEM_VIEW,
    PERMISSIONS.AUDIT_LOGS_VIEW,
    PERMISSIONS.SECURITY_CENTER_VIEW,
    PERMISSIONS.SOLANA_WALLETS_VIEW,
    PERMISSIONS.SOLANA_ATTESTATIONS_VIEW,
    PERMISSIONS.SOLANA_PROVENANCE_VIEW,
  ],
  SUPER_ADMIN: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.USERS_DELETE,
    PERMISSIONS.USERS_SUSPEND,
    PERMISSIONS.USERS_IMPERSONATE,
    PERMISSIONS.ROLES_READ,
    PERMISSIONS.ROLES_MANAGE,
    PERMISSIONS.PERMISSIONS_READ,
    PERMISSIONS.PERMISSIONS_MANAGE,
    PERMISSIONS.KYC_VIEW,
    PERMISSIONS.KYC_REVIEW,
    PERMISSIONS.KYC_APPROVE,
    PERMISSIONS.KYC_REJECT,
    PERMISSIONS.KYC_RESUBMIT_REQUEST,
    PERMISSIONS.KYC_DOCUMENTS_VIEW,
    PERMISSIONS.KYC_DOCUMENT_TYPES_MANAGE,
    PERMISSIONS.SIGNALS_VIEW,
    PERMISSIONS.SIGNALS_MONITOR,
    PERMISSIONS.SIGNALS_REPLAY,
    PERMISSIONS.SIGNALS_REPROCESS,
    PERMISSIONS.PROVIDERS_READ,
    PERMISSIONS.PROVIDERS_CREATE,
    PERMISSIONS.PROVIDERS_APPROVE,
    PERMISSIONS.PROVIDERS_SUSPEND,
    PERMISSIONS.PROVIDERS_MANAGE,
    PERMISSIONS.PROVIDERS_CERTIFY,
    PERMISSIONS.TRADES_VIEW,
    PERMISSIONS.TRADES_VIEW_ALL,
    PERMISSIONS.TRADES_INTERVENE,
    PERMISSIONS.TRADES_FORCE_CLOSE,
    PERMISSIONS.BROKERS_READ,
    PERMISSIONS.BROKERS_MANAGE,
    PERMISSIONS.BROKERS_ACCOUNTS_VIEW,
    PERMISSIONS.BROKERS_ACCOUNTS_MANAGE,
    PERMISSIONS.SUBSCRIPTIONS_VIEW,
    PERMISSIONS.SUBSCRIPTIONS_MANAGE,
    PERMISSIONS.PLANS_MANAGE,
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.PAYMENTS_MANAGE,
    PERMISSIONS.PAYMENTS_REFUND,
    PERMISSIONS.WITHDRAWALS_VIEW,
    PERMISSIONS.WITHDRAWALS_APPROVE,
    PERMISSIONS.WITHDRAWALS_REJECT,
    PERMISSIONS.REFERRALS_VIEW,
    PERMISSIONS.REFERRALS_MANAGE,
    PERMISSIONS.REFERRALS_SETTLE,
    PERMISSIONS.REFERRALS_REVIEW,
    PERMISSIONS.MARKETPLACE_VIEW,
    PERMISSIONS.MARKETPLACE_MODERATE,
    PERMISSIONS.MARKETPLACE_LISTINGS_MANAGE,
    PERMISSIONS.AFFILIATE_VIEW,
    PERMISSIONS.AFFILIATE_MANAGE,
    PERMISSIONS.IB_VIEW,
    PERMISSIONS.IB_MANAGE,
    PERMISSIONS.WHITE_LABEL_VIEW,
    PERMISSIONS.WHITE_LABEL_MANAGE,
    PERMISSIONS.NOTIFICATIONS_VIEW,
    PERMISSIONS.NOTIFICATIONS_MANAGE,
    PERMISSIONS.ADMIN_DASHBOARD_VIEW,
    PERMISSIONS.ADMIN_SETTINGS_MANAGE,
    PERMISSIONS.ADMIN_SYSTEM_VIEW,
    PERMISSIONS.ADMIN_FRAUD_VIEW,
    PERMISSIONS.AUDIT_LOGS_VIEW,
    PERMISSIONS.AUDIT_LOGS_EXPORT,
    PERMISSIONS.SECURITY_CENTER_VIEW,
    PERMISSIONS.SECURITY_THREATS_MANAGE,
    PERMISSIONS.SECURITY_API_KEYS_MANAGE,
    PERMISSIONS.EXECUTIVE_DASHBOARD_VIEW,
    PERMISSIONS.EXECUTIVE_FINANCIALS_VIEW,
    PERMISSIONS.SUPPORT_TICKETS_VIEW,
    PERMISSIONS.SUPPORT_TICKETS_MANAGE,
    PERMISSIONS.SUPPORT_KNOWLEDGE_BASE_MANAGE,
    PERMISSIONS.SOLANA_WALLETS_VIEW,
    PERMISSIONS.SOLANA_ATTESTATIONS_VIEW,
    PERMISSIONS.SOLANA_ATTESTATIONS_MANAGE,
    PERMISSIONS.SOLANA_PROVENANCE_VIEW,
    PERMISSIONS.SOLANA_PAYMENTS_VIEW,
    PERMISSIONS.SOLANA_PAYMENTS_MANAGE,
    PERMISSIONS.SOLANA_PROGRAM_MANAGE,
  ],
});

export function getPermissionsForRole(roleName) {
  return ROLE_PERMISSION_MAP[roleName] || [];
}

export function isKnownPermission(name) {
  return PERMISSION_DEFINITIONS.some((p) => p.name === name);
}

export function getPermissionGroups() {
  return PERMISSION_GROUPS;
}

export function getPermissionsByGroup(group) {
  return PERMISSION_DEFINITIONS.filter((p) => p.group === group);
}