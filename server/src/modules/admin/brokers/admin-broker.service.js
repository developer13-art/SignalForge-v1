/**
 * Admin Broker Service
 *
 * @module server/modules/admin/brokers/admin-broker.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { normalizePagination, buildPaginationMeta } from '@signalforge/shared/utils/pagination.util';
import * as repository from './admin-broker.repository';
import { adminService } from '../admin.service';

export async function listBrokerAccounts({ filters = {}, pagination = {} }) {
  const { page, limit, offset } = normalizePagination(pagination);

  const result = await repository.listBrokerAccounts({
    filters,
    pagination: { limit, offset },
  });

  return {
    items: result.items.map((row) => ({
      brokerAccountId: row.id,
      userId: row.user_id,
      userEmail: row.user_email,
      accountNickname: row.account_nickname,
      platform: row.platform,
      accountType: row.account_type,
      connectionStatus: row.connection_status,
      balance: row.balance,
      equity: row.equity,
      currency: row.currency,
      metaApiAccountId: row.metaapi_account_id,
      lastSyncedAt: row.last_synced_at,
      createdAt: row.created_at,
    })),
    meta: buildPaginationMeta({ page, limit, total: result.total }),
  };
}

export async function getBrokerAccountDetails({ brokerAccountId }) {
  if (!brokerAccountId) {
    throw new AppError('brokerAccountId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const account = await repository.findBrokerAccountById({ brokerAccountId });

  if (!account) {
    throw new AppError('Broker account not found', ERROR_CODES.NOT_FOUND, 404);
  }

  return account;
}

export async function forceDisconnectBroker({ brokerAccountId, adminId, reason }) {
  if (!brokerAccountId || !adminId) {
    throw new AppError('brokerAccountId and adminId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const updated = await repository.markBrokerDisconnected({ brokerAccountId, adminId, reason });

  if (!updated) {
    throw new AppError('Broker account not found', ERROR_CODES.NOT_FOUND, 404);
  }

  await adminService.recordAdminAction({
    adminId,
    action: 'BROKER_DISCONNECT',
    targetType: 'BROKER_ACCOUNT',
    targetId: brokerAccountId,
    details: { reason },
  });

  logger.info({ brokerAccountId, adminId, reason }, 'Broker account force-disconnected');

  return { disconnected: true };
}

export async function getConnectionStatusBreakdown() {
  const rows = await repository.countByConnectionStatus();

  const breakdown = {};
  for (const row of rows) {
    breakdown[row.connection_status] = row.count;
  }

  return breakdown;
}

export const adminBrokerService = {
  listBrokerAccounts,
  getBrokerAccountDetails,
  forceDisconnectBroker,
  getConnectionStatusBreakdown,
};