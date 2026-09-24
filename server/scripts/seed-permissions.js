#!/usr/bin/env node
/**
 * Seed Permissions Script
 *
 * @module server/scripts/seed-permissions
 */

import { db } from '../src/database';
import { closePool } from '../src/database/connection';
import { logger } from '../src/lib/logger';
import { PERMISSIONS, PERMISSION_VALUES } from '@signalforge/shared/constants/permissions';
import { ROLES, ROLE_VALUES } from '@signalforge/shared/constants/roles';

const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: ['*'],
};

const ADMIN_PERMISSIONS = [
  PERMISSIONS.USERS_READ,
  PERMISSIONS.USERS_UPDATE,
  PERMISSIONS.USERS_SUSPEND,
  PERMISSIONS.KYC_VIEW,
  PERMISSIONS.KYC_REVIEW,
  PERMISSIONS.KYC_APPROVE,
  PERMISSIONS.KYC_REJECT,
  PERMISSIONS.PROVIDERS_READ,
  PERMISSIONS.PROVIDERS_MANAGE,
  PERMISSIONS.SIGNALS_VIEW,
  PERMISSIONS.SIGNALS_MONITOR,
  PERMISSIONS.TRADES_VIEW_ALL,
  PERMISSIONS.BROKERS_READ,
  PERMISSIONS.BROKERS_MANAGE,
  PERMISSIONS.SUBSCRIPTIONS_VIEW,
  PERMISSIONS.PAYMENTS_VIEW,
  PERMISSIONS.WITHDRAWALS_VIEW,
  PERMISSIONS.REFERRALS_VIEW,
  PERMISSIONS.MARKETPLACE_MODERATE,
  PERMISSIONS.NOTIFICATIONS_VIEW,
  PERMISSIONS.ADMIN_DASHBOARD_VIEW,
  PERMISSIONS.ADMIN_SETTINGS_MANAGE,
  PERMISSIONS.ADMIN_SYSTEM_VIEW,
  PERMISSIONS.AUDIT_LOGS_VIEW,
  PERMISSIONS.SECURITY_CENTER_VIEW,
  PERMISSIONS.EXECUTIVE_DASHBOARD_VIEW,
  PERMISSIONS.SOLANA_WALLETS_VIEW,
  PERMISSIONS.SOLANA_ATTESTATIONS_VIEW,
  PERMISSIONS.SOLANA_PROVENANCE_VIEW,
  PERMISSIONS.SOLANA_PAYMENTS_VIEW,
];

const COMPLIANCE_PERMISSIONS = [
  PERMISSIONS.KYC_VIEW,
  PERMISSIONS.KYC_REVIEW,
  PERMISSIONS.KYC_APPROVE,
  PERMISSIONS.KYC_REJECT,
  PERMISSIONS.KYC_RESUBMIT_REQUEST,
  PERMISSIONS.KYC_DOCUMENTS_VIEW,
  PERMISSIONS.KYC_DOCUMENT_TYPES_MANAGE,
  PERMISSIONS.USERS_READ,
  PERMISSIONS.AUDIT_LOGS_VIEW,
];

const SUPPORT_PERMISSIONS = [
  PERMISSIONS.USERS_READ,
  PERMISSIONS.SUPPORT_TICKETS_VIEW,
  PERMISSIONS.SUPPORT_TICKETS_MANAGE,
  PERMISSIONS.SUPPORT_KNOWLEDGE_BASE_MANAGE,
  PERMISSIONS.KYC_VIEW,
  PERMISSIONS.NOTIFICATIONS_VIEW,
];

(async () => {
  try {
    for (const roleName of ROLE_VALUES) {
      await db.query(
        `INSERT INTO roles (name, description, created_at, updated_at)
         VALUES ($1, $2, NOW(), NOW())
         ON CONFLICT (name) DO NOTHING`,
        [roleName, `Role: ${roleName}`],
      );
    }

    for (const permissionName of PERMISSION_VALUES) {
      await db.query(
        `INSERT INTO permissions (name, description, created_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (name) DO NOTHING`,
        [permissionName, `Permission: ${permissionName}`],
      );
    }

    const { rows: roleRows } = await db.query(`SELECT id, name FROM roles`);
    const { rows: permissionRows } = await db.query(`SELECT id, name FROM permissions`);

    const roleMap = Object.fromEntries(roleRows.map((r) => [r.name, r.id]));
    const permMap = Object.fromEntries(permissionRows.map((p) => [p.name, p.id]));

    const grant = async (roleName, permissionName) => {
      const roleId = roleMap[roleName];
      const permissionId = permMap[permissionName];
      if (!roleId || !permissionId) {
        return;
      }
      await db.query(
        `INSERT INTO role_permissions (role_id, permission_id)
         VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [roleId, permissionId],
      );
    };

    for (const permission of ADMIN_PERMISSIONS) {
      await grant(ROLES.ADMIN, permission);
    }

    for (const permission of COMPLIANCE_PERMISSIONS) {
      await grant(ROLES.COMPLIANCE_OFFICER, permission);
    }

    for (const permission of SUPPORT_PERMISSIONS) {
      await grant(ROLES.SUPPORT, permission);
    }

    for (const role of Object.keys(ROLE_PERMISSIONS)) {
      for (const permission of PERMISSION_VALUES) {
        await grant(role, permission);
      }
    }

    logger.info('Permissions seeded');
    process.exit(0);
  } catch (err) {
    logger.error({ err }, 'Failed to seed permissions');
    process.exit(1);
  } finally {
    await closePool();
  }
})();