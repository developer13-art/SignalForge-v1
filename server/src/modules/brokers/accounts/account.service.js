/**
 * Broker Account Service (facade)
 *
 * @module signalforge/server/modules/brokers/accounts/service
 */

import { AccountRepository } from './account.repository.js';
import { AccountConnectionService } from './account-connection.service.js';
import { AccountSyncService } from './account-sync.service.js';
import { AccountSnapshotService } from './account-snapshot.service.js';
import { AccountHealthService } from './account-health.service.js';
import { BrokerAccountNotFoundError } from '../broker.errors.js';

export class AccountService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new AccountRepository();
    this.connection = dependencies.connection || new AccountConnectionService({
      repository: this.repository,
    });
    this.sync = dependencies.sync || new AccountSyncService({
      repository: this.repository,
    });
    this.snapshot = dependencies.snapshot || new AccountSnapshotService(this.repository);
    this.health = dependencies.health || new AccountHealthService(this.repository);
  }

  async connectAccount(userId, payload) {
    return this.connection.connectAccount(userId, payload);
  }

  async disconnectAccount(userId, accountId) {
    return this.connection.disconnectAccount(userId, accountId);
  }

  async removeAccount(userId, accountId) {
    return this.connection.removeAccount(userId, accountId);
  }

  async updateCredentials(userId, accountId, payload) {
    return this.connection.updateCredentials(userId, accountId, payload);
  }

  async getAccount(userId, accountId) {
    const row = await this.repository.findByIdForUser(accountId, userId);
    if (!row) {
      throw new BrokerAccountNotFoundError();
    }
    return this.serialize(row);
  }

  async listAccounts(userId, filters = {}) {
    const rows = await this.repository.listForUser(userId, filters);
    return rows.map((r) => this.serialize(r));
  }

  async syncAccount(userId, accountId) {
    return this.sync.syncAccount(userId, accountId);
  }

  async getCurrentPrice(userId, accountId, symbol) {
    return this.sync.getCurrentPrice(userId, accountId, symbol);
  }

  async getSymbolSpecification(userId, accountId, symbol) {
    return this.sync.getSymbolSpecification(userId, accountId, symbol);
  }

  async captureSnapshot(accountId) {
    return this.snapshot.captureSnapshot(accountId);
  }

  async listSnapshots(accountId, filters, pagination) {
    return this.snapshot.listSnapshots(accountId, filters, pagination);
  }

  async checkHealth(accountId) {
    return this.health.checkAccount(accountId);
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      userId: row.user_id,
      brokerId: row.broker_id,
      brokerName: row.broker_name,
      platform: row.platform,
      accountNumber: row.account_number,
      accountNickname: row.account_nickname,
      server: row.server,
      accountType: row.account_type,
      accountCurrency: row.account_currency,
      leverage: row.leverage,
      status: row.status,
      metaApiAccountId: row.metaapi_account_id,
      balance: row.balance,
      equity: row.equity,
      margin: row.margin,
      freeMargin: row.free_margin,
      marginLevel: row.margin_level,
      lastSyncAt: row.last_sync_at,
      lastError: row.last_error,
      lastErrorAt: row.last_error_at,
      connectedAt: row.connected_at,
      disconnectedAt: row.disconnected_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export default AccountService;