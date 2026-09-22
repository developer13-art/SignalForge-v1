/**
 * Permissions
 *
 * Defines the granular permissions used across the platform. Permissions
 * follow a `<domain>.<action>` naming convention. Roles are mapped to
 * permissions through the roles-permissions relationship in the database.
 *
 * @module @signalforge/shared/constants/permissions
 */

export const PERMISSIONS = Object.freeze({
  // Users
  USERS_READ: 'users.read',
  USERS_CREATE: 'users.create',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',
  USERS_SUSPEND: 'users.suspend',
  USERS_IMPERSONATE: 'users.impersonate',

  // Roles and RBAC
  ROLES_READ: 'roles.read',
  ROLES_MANAGE: 'roles.manage',
  PERMISSIONS_READ: 'permissions.read',
  PERMISSIONS_MANAGE: 'permissions.manage',

  // KYC
  KYC_VIEW: 'kyc.view',
  KYC_REVIEW: 'kyc.review',
  KYC_APPROVE: 'kyc.approve',
  KYC_REJECT: 'kyc.reject',
  KYC_RESUBMIT_REQUEST: 'kyc.resubmit.request',
  KYC_DOCUMENTS_VIEW: 'kyc.documents.view',
  KYC_DOCUMENT_TYPES_MANAGE: 'kyc.document.types.manage',

  // Signals
  SIGNALS_VIEW: 'signals.view',
  SIGNALS_MONITOR: 'signals.monitor',
  SIGNALS_REPLAY: 'signals.replay',
  SIGNALS_REPROCESS: 'signals.reprocess',

  // Providers
  PROVIDERS_READ: 'providers.read',
  PROVIDERS_CREATE: 'providers.create',
  PROVIDERS_APPROVE: 'providers.approve',
  PROVIDERS_SUSPEND: 'providers.suspend',
  PROVIDERS_MANAGE: 'providers.manage',
  PROVIDERS_CERTIFY: 'providers.certify',

  // Trades
  TRADES_VIEW: 'trades.view',
  TRADES_VIEW_ALL: 'trades.view.all',
  TRADES_INTERVENE: 'trades.intervene',
  TRADES_FORCE_CLOSE: 'trades.force.close',

  // Brokers
  BROKERS_READ: 'brokers.read',
  BROKERS_MANAGE: 'brokers.manage',
  BROKERS_ACCOUNTS_VIEW: 'brokers.accounts.view',
  BROKERS_ACCOUNTS_MANAGE: 'brokers.accounts.manage',

  // Subscriptions
  SUBSCRIPTIONS_VIEW: 'subscriptions.view',
  SUBSCRIPTIONS_MANAGE: 'subscriptions.manage',
  PLANS_MANAGE: 'plans.manage',

  // Payments
  PAYMENTS_VIEW: 'payments.view',
  PAYMENTS_MANAGE: 'payments.manage',
  PAYMENTS_REFUND: 'payments.refund',

  // Withdrawals
  WITHDRAWALS_VIEW: 'withdrawals.view',
  WITHDRAWALS_APPROVE: 'withdrawals.approve',
  WITHDRAWALS_REJECT: 'withdrawals.reject',

  // Referrals
  REFERRALS_VIEW: 'referrals.view',
  REFERRALS_MANAGE: 'referrals.manage',
  REFERRALS_SETTLE: 'referrals.settle',
  REFERRALS_REVIEW: 'referrals.review',

  // Marketplace
  MARKETPLACE_VIEW: 'marketplace.view',
  MARKETPLACE_MODERATE: 'marketplace.moderate',
  MARKETPLACE_LISTINGS_MANAGE: 'marketplace.listings.manage',

  // Affiliate and IB
  AFFILIATE_VIEW: 'affiliate.view',
  AFFILIATE_MANAGE: 'affiliate.manage',
  IB_VIEW: 'ib.view',
  IB_MANAGE: 'ib.manage',

  // White Label
  WHITE_LABEL_VIEW: 'white.label.view',
  WHITE_LABEL_MANAGE: 'white.label.manage',

  // Notifications
  NOTIFICATIONS_VIEW: 'notifications.view',
  NOTIFICATIONS_MANAGE: 'notifications.manage',

  // Admin
  ADMIN_DASHBOARD_VIEW: 'admin.dashboard.view',
  ADMIN_SETTINGS_MANAGE: 'admin.settings.manage',
  ADMIN_SYSTEM_VIEW: 'admin.system.view',
  ADMIN_FRAUD_VIEW: 'admin.fraud.view',

  // Audit Logs
  AUDIT_LOGS_VIEW: 'audit.logs.view',
  AUDIT_LOGS_EXPORT: 'audit.logs.export',

  // Security
  SECURITY_CENTER_VIEW: 'security.center.view',
  SECURITY_THREATS_MANAGE: 'security.threats.manage',
  SECURITY_API_KEYS_MANAGE: 'security.api.keys.manage',

  // Executive
  EXECUTIVE_DASHBOARD_VIEW: 'executive.dashboard.view',
  EXECUTIVE_FINANCIALS_VIEW: 'executive.financials.view',

  // Support
  SUPPORT_TICKETS_VIEW: 'support.tickets.view',
  SUPPORT_TICKETS_MANAGE: 'support.tickets.manage',
  SUPPORT_KNOWLEDGE_BASE_MANAGE: 'support.knowledge.base.manage',

  // Solana
  SOLANA_WALLETS_VIEW: 'solana.wallets.view',
  SOLANA_ATTESTATIONS_VIEW: 'solana.attestations.view',
  SOLANA_ATTESTATIONS_MANAGE: 'solana.attestations.manage',
  SOLANA_PROVENANCE_VIEW: 'solana.provenance.view',
  SOLANA_PAYMENTS_VIEW: 'solana.payments.view',
  SOLANA_PAYMENTS_MANAGE: 'solana.payments.manage',
  SOLANA_PROGRAM_MANAGE: 'solana.program.manage',
});

export const PERMISSION_VALUES = Object.freeze(Object.values(PERMISSIONS));

export function isValidPermission(permission) {
  return PERMISSION_VALUES.includes(permission);
}

export const PERMISSION_GROUPS = Object.freeze({
  users: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.USERS_DELETE,
    PERMISSIONS.USERS_SUSPEND,
    PERMISSIONS.USERS_IMPERSONATE,
  ],
  rbac: [
    PERMISSIONS.ROLES_READ,
    PERMISSIONS.ROLES_MANAGE,
    PERMISSIONS.PERMISSIONS_READ,
    PERMISSIONS.PERMISSIONS_MANAGE,
  ],
  kyc: [
    PERMISSIONS.KYC_VIEW,
    PERMISSIONS.KYC_REVIEW,
    PERMISSIONS.KYC_APPROVE,
    PERMISSIONS.KYC_REJECT,
    PERMISSIONS.KYC_RESUBMIT_REQUEST,
    PERMISSIONS.KYC_DOCUMENTS_VIEW,
    PERMISSIONS.KYC_DOCUMENT_TYPES_MANAGE,
  ],
  signals: [
    PERMISSIONS.SIGNALS_VIEW,
    PERMISSIONS.SIGNALS_MONITOR,
    PERMISSIONS.SIGNALS_REPLAY,
    PERMISSIONS.SIGNALS_REPROCESS,
  ],
  providers: [
    PERMISSIONS.PROVIDERS_READ,
    PERMISSIONS.PROVIDERS_CREATE,
    PERMISSIONS.PROVIDERS_APPROVE,
    PERMISSIONS.PROVIDERS_SUSPEND,
    PERMISSIONS.PROVIDERS_MANAGE,
    PERMISSIONS.PROVIDERS_CERTIFY,
  ],
  trades: [
    PERMISSIONS.TRADES_VIEW,
    PERMISSIONS.TRADES_VIEW_ALL,
    PERMISSIONS.TRADES_INTERVENE,
    PERMISSIONS.TRADES_FORCE_CLOSE,
  ],
  brokers: [
    PERMISSIONS.BROKERS_READ,
    PERMISSIONS.BROKERS_MANAGE,
    PERMISSIONS.BROKERS_ACCOUNTS_VIEW,
    PERMISSIONS.BROKERS_ACCOUNTS_MANAGE,
  ],
  subscriptions: [
    PERMISSIONS.SUBSCRIPTIONS_VIEW,
    PERMISSIONS.SUBSCRIPTIONS_MANAGE,
    PERMISSIONS.PLANS_MANAGE,
  ],
  payments: [
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.PAYMENTS_MANAGE,
    PERMISSIONS.PAYMENTS_REFUND,
  ],
  withdrawals: [
    PERMISSIONS.WITHDRAWALS_VIEW,
    PERMISSIONS.WITHDRAWALS_APPROVE,
    PERMISSIONS.WITHDRAWALS_REJECT,
  ],
  referrals: [
    PERMISSIONS.REFERRALS_VIEW,
    PERMISSIONS.REFERRALS_MANAGE,
    PERMISSIONS.REFERRALS_SETTLE,
    PERMISSIONS.REFERRALS_REVIEW,
  ],
  marketplace: [
    PERMISSIONS.MARKETPLACE_VIEW,
    PERMISSIONS.MARKETPLACE_MODERATE,
    PERMISSIONS.MARKETPLACE_LISTINGS_MANAGE,
  ],
  affiliate: [
    PERMISSIONS.AFFILIATE_VIEW,
    PERMISSIONS.AFFILIATE_MANAGE,
  ],
  ib: [
    PERMISSIONS.IB_VIEW,
    PERMISSIONS.IB_MANAGE,
  ],
  whiteLabel: [
    PERMISSIONS.WHITE_LABEL_VIEW,
    PERMISSIONS.WHITE_LABEL_MANAGE,
  ],
  notifications: [
    PERMISSIONS.NOTIFICATIONS_VIEW,
    PERMISSIONS.NOTIFICATIONS_MANAGE,
  ],
  admin: [
    PERMISSIONS.ADMIN_DASHBOARD_VIEW,
    PERMISSIONS.ADMIN_SETTINGS_MANAGE,
    PERMISSIONS.ADMIN_SYSTEM_VIEW,
    PERMISSIONS.ADMIN_FRAUD_VIEW,
  ],
  auditLogs: [
    PERMISSIONS.AUDIT_LOGS_VIEW,
    PERMISSIONS.AUDIT_LOGS_EXPORT,
  ],
  security: [
    PERMISSIONS.SECURITY_CENTER_VIEW,
    PERMISSIONS.SECURITY_THREATS_MANAGE,
    PERMISSIONS.SECURITY_API_KEYS_MANAGE,
  ],
  executive: [
    PERMISSIONS.EXECUTIVE_DASHBOARD_VIEW,
    PERMISSIONS.EXECUTIVE_FINANCIALS_VIEW,
  ],
  support: [
    PERMISSIONS.SUPPORT_TICKETS_VIEW,
    PERMISSIONS.SUPPORT_TICKETS_MANAGE,
    PERMISSIONS.SUPPORT_KNOWLEDGE_BASE_MANAGE,
  ],
  solana: [
    PERMISSIONS.SOLANA_WALLETS_VIEW,
    PERMISSIONS.SOLANA_ATTESTATIONS_VIEW,
    PERMISSIONS.SOLANA_ATTESTATIONS_MANAGE,
    PERMISSIONS.SOLANA_PROVENANCE_VIEW,
    PERMISSIONS.SOLANA_PAYMENTS_VIEW,
    PERMISSIONS.SOLANA_PAYMENTS_MANAGE,
    PERMISSIONS.SOLANA_PROGRAM_MANAGE,
  ],
});