/**
 * Admin Service
 *
 * Top-level orchestration for administrative operations. Delegates
 * to specialized admin services for each domain and provides
 * platform-wide statistics.
 *
 * @module server/modules/admin/admin.service
 */

import { AppError } from '../../lib/errors/app-error';
import { ERROR_CODES } from '../../lib/errors/error-codes';
import { logger } from '../../lib/logger';
import { db } from '../../database';
import { publishEvent } from '../../events/event-publisher';
import { EVENT_TYPES } from '@signalforge/shared/constants/event-types';
import { adminUserService } from './users/admin-user.service';
import { adminProviderService } from './providers/admin-provider.service';
import { adminSignalMonitorService } from './signals/admin-signal-monitor.service';
import { adminTradeMonitorService } from './trades/admin-trade-monitor.service';
import { adminBrokerService } from './brokers/admin-broker.service';
import { adminKycService } from './kyc/admin-kyc.service';
import { adminMarketplaceService } from './marketplace/admin-marketplace.service';
import { adminReferralService } from './referrals/admin-referral.service';
import { adminSubscriptionService } from './subscriptions/admin-subscription.service';
import { adminPaymentService } from './payments/admin-payment.service';
import { adminWithdrawalService } from './withdrawals/admin-withdrawal.service';
import { adminAffiliateService } from './affiliate/admin-affiliate.service';
import { systemSettingsService } from './system/system-settings.service';
import { systemHealthService } from './system/system-health.service';
import { featureFlagService } from './system/feature-flag.service';
import { adminReportService } from './reports/admin-report.service';

export async function getPlatformOverview({ since }) {
  const sinceDate = since || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { rows: userRows } = await db.query(
    `SELECT
       COUNT(*)::int AS total_users,
       COUNT(*) FILTER (WHERE created_at >= $1)::int AS new_users,
       COUNT(*) FILTER (WHERE status = 'ACTIVE')::int AS active_users,
       COUNT(*) FILTER (WHERE kyc_status = 'VERIFIED')::int AS kyc_verified
       FROM users`,
    [sinceDate],
  );

  const { rows: providerRows } = await db.query(
    `SELECT
       COUNT(*)::int AS total_providers,
       COUNT(*) FILTER (WHERE status = 'ACTIVE')::int AS active_providers
       FROM providers`,
  );

  const { rows: signalRows } = await db.query(
    `SELECT
       COUNT(*)::int AS total_signals,
       COUNT(*) FILTER (WHERE created_at >= $1)::int AS recent_signals,
       COUNT(*) FILTER (WHERE status = 'EXECUTED')::int AS executed_signals
       FROM signals`,
    [sinceDate],
  );

  const { rows: tradeRows } = await db.query(
    `SELECT
       COUNT(*)::int AS total_trades,
       COUNT(*) FILTER (WHERE status = 'OPEN')::int AS open_trades,
       COALESCE(SUM(realized_profit), 0)::numeric AS total_realized_profit
       FROM trades`,
  );

  const { rows: revenueRows } = await db.query(
    `SELECT COALESCE(SUM(amount), 0)::numeric AS total_revenue
       FROM payments
      WHERE status = 'SUCCEEDED' AND created_at >= $1`,
    [sinceDate],
  );

  return {
    since: sinceDate,
    users: userRows[0] || {},
    providers: providerRows[0] || {},
    signals: signalRows[0] || {},
    trades: {
      total: tradeRows[0]?.total_trades || 0,
      open: tradeRows[0]?.open_trades || 0,
      totalRealizedProfit: Number(tradeRows[0]?.total_realized_profit || 0),
    },
    revenue: {
      total: Number(revenueRows[0]?.total_revenue || 0),
      currency: 'USD',
    },
  };
}

export async function recordAdminAction({ adminId, action, targetType, targetId, details }) {
  if (!adminId || !action) {
    throw new AppError('adminId and action are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rows } = await db.query(
    `INSERT INTO admin_actions
       (admin_id, action, target_type, target_id, details, created_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [
      adminId,
      action,
      targetType || null,
      targetId || null,
      details ? JSON.stringify(details) : null,
      new Date().toISOString(),
    ],
  );

  await publishEvent({
    eventType: EVENT_TYPES.AUDIT_LOG_CREATED,
    source: 'admin.service',
    actorId: adminId,
    payload: {
      actionId: rows[0]?.id,
      action,
      targetType,
      targetId,
      details,
    },
  }).catch((err) => logger.warn({ err }, 'Failed to publish admin action event'));

  logger.info({ adminId, action, targetType, targetId }, 'Admin action recorded');

  return { actionId: rows[0]?.id };
}

export async function listRecentAdminActions({ limit = 50 }) {
  const { rows } = await db.query(
    `SELECT a.id, a.admin_id, u.email AS admin_email, a.action, a.target_type, a.target_id, a.details, a.created_at
       FROM admin_actions a
       LEFT JOIN users u ON u.id = a.admin_id
      ORDER BY a.created_at DESC
      LIMIT $1`,
    [limit],
  );

  return rows.map((row) => ({
    actionId: row.id,
    adminId: row.admin_id,
    adminEmail: row.admin_email,
    action: row.action,
    targetType: row.target_type,
    targetId: row.target_id,
    details: row.details ? (typeof row.details === 'string' ? JSON.parse(row.details) : row.details) : null,
    createdAt: row.created_at,
  }));
}

export const adminService = {
  getPlatformOverview,
  recordAdminAction,
  listRecentAdminActions,

  users: adminUserService,
  providers: adminProviderService,
  signals: adminSignalMonitorService,
  trades: adminTradeMonitorService,
  brokers: adminBrokerService,
  kyc: adminKycService,
  marketplace: adminMarketplaceService,
  referrals: adminReferralService,
  subscriptions: adminSubscriptionService,
  payments: adminPaymentService,
  withdrawals: adminWithdrawalService,
  affiliate: adminAffiliateService,
  settings: systemSettingsService,
  health: systemHealthService,
  flags: featureFlagService,
  reports: adminReportService,
};