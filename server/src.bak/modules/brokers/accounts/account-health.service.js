/**
 * Broker Account Health Service
 *
 * @module signalforge/server/modules/brokers/accounts/health
 */

import { AccountRepository } from './account.repository.js';
import { emitAccountHealthCheck, emitAccountError } from '../broker.events.js';
import { DEFAULT_HEALTH_CHECK_INTERVAL_MS } from '../broker.constants.js';
import { getLogger } from '../../../bootstrap/initLogger.js';

export class AccountHealthService {
  constructor(repository = null) {
    this.repository = repository || new AccountRepository();
    this.logger = getLogger('broker-account-health');
    this.intervalHandle = null;
  }

  async checkAccount(accountId) {
    const account = await this.repository.findById(accountId);
    if (!account) {
      return { healthy: false, reason: 'ACCOUNT_NOT_FOUND' };
    }

    const healthy = ['CONNECTED', 'SYNCHRONIZING', 'DEPLOYED'].includes(account.status);

    await emitAccountHealthCheck(account.id, healthy, {
      status: account.status,
      lastSyncAt: account.last_sync_at,
    });

    if (!healthy) {
      await emitAccountError(account.id, account.user_id, new Error(`Unhealthy status: ${account.status}`));
    }

    return {
      healthy,
      accountId: account.id,
      status: account.status,
      lastSyncAt: account.last_sync_at,
    };
  }

  async checkAll() {
    const accounts = await this.repository.listConnected();
    const results = [];
    for (const account of accounts) {
      try {
        const result = await this.checkAccount(account.id);
        results.push(result);
      } catch (error) {
        this.logger.error({ err: error, accountId: account.id }, 'Health check failed');
      }
    }
    return { checked: results.length, results };
  }

  start(intervalMs = DEFAULT_HEALTH_CHECK_INTERVAL_MS) {
    if (this.intervalHandle) {
      return;
    }
    this.intervalHandle = setInterval(() => this.checkAll(), intervalMs);
    if (this.intervalHandle.unref) {
      this.intervalHandle.unref();
    }
  }

  stop() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }
}

export default AccountHealthService;