/**
 * MetaApi Sync Service
 *
 * @module signalforge/server/modules/brokers/metaapi/sync
 */

import { MetaApiClient } from './metaapi.client.js';
import { AccountRepository } from '../accounts/account.repository.js';
import { getLogger } from '../../../bootstrap/initLogger.js';
import {
  emitAccountSynced,
  emitAccountError,
} from '../broker.events.js';

export class MetaApiSyncService {
  constructor(dependencies = {}) {
    this.client = dependencies.client || new MetaApiClient();
    this.repository = dependencies.repository || new AccountRepository();
    this.logger = getLogger('metaapi-sync');
  }

  async syncAccount(accountId) {
    const account = await this.repository.findById(accountId);
    if (!account || !account.metaapi_account_id) {
      throw new Error('MetaApi account not found');
    }

    try {
      const [info, positions, orders] = await Promise.all([
        this.client.getAccountInformation(account.metaapi_account_id),
        this.client.getPositions(account.metaapi_account_id),
        this.client.getOrders(account.metaapi_account_id),
      ]);

      const openPositions = Array.isArray(positions) ? positions : positions?.positions || [];
      const openOrders = Array.isArray(orders) ? orders : orders?.orders || [];

      await this.repository.update(account.id, {
        balance: info.balance ?? null,
        equity: info.equity ?? null,
        margin: info.margin ?? null,
        freeMargin: info.freeMargin ?? null,
        marginLevel: info.marginLevel ?? null,
        leverage: info.leverage ?? account.leverage,
        accountCurrency: info.currency || account.account_currency,
        lastSyncAt: new Date(),
        status: 'CONNECTED',
      });

      await this.repository.createSnapshot({
        brokerAccountId: account.id,
        userId: account.user_id,
        balance: info.balance,
        equity: info.equity,
        margin: info.margin,
        freeMargin: info.freeMargin,
        marginLevel: info.marginLevel,
        openPositions: openPositions.length,
        openOrders: openOrders.length,
      });

      const summary = {
        balance: info.balance,
        equity: info.equity,
        positions: openPositions.length,
        orders: openOrders.length,
      };

      await emitAccountSynced(account.id, account.user_id, summary);

      return {
        synced: true,
        account: { id: account.id },
        summary,
        positions: openPositions,
        orders: openOrders,
      };
    } catch (error) {
      await this.repository.update(account.id, {
        lastError: error.message,
        lastErrorAt: new Date(),
        status: 'ERROR',
      });
      await emitAccountError(account.id, account.user_id, error);
      throw error;
    }
  }

  async syncAllConnected() {
    const accounts = await this.repository.listConnected();
    const results = { synced: 0, failed: 0 };
    for (const account of accounts) {
      try {
        await this.syncAccount(account.id);
        results.synced++;
      } catch (error) {
        this.logger.error({ err: error, accountId: account.id }, 'Account sync failed');
        results.failed++;
      }
    }
    return results;
  }

  async getCurrentPrice(accountId, symbol) {
    const account = await this.repository.findById(accountId);
    if (!account || !account.metaapi_account_id) {
      throw new Error('MetaApi account not found');
    }
    return this.client.getCurrentPrice(account.metaapi_account_id, symbol);
  }

  async getSymbolSpecification(accountId, symbol) {
    const account = await this.repository.findById(accountId);
    if (!account || !account.metaapi_account_id) {
      throw new Error('MetaApi account not found');
    }
    return this.client.getSymbolSpecification(account.metaapi_account_id, symbol);
  }
}

export default MetaApiSyncService;