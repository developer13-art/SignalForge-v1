/**
 * Broker Account Sync Service
 *
 * @module signalforge/server/modules/brokers/accounts/sync
 */
const { AccountRepository } = require('./account.repository.js');
const { MetaApiSyncService } = require('../metaapi/metaapi-sync.service.js');
const { getLogger } = require('../../../bootstrap/initLogger.js');
class AccountSyncService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new AccountRepository();
    this.sync = dependencies.sync || new MetaApiSyncService();
    this.logger = getLogger('broker-account-sync');
  }

  async syncAccount(userId, accountId) {
    const account = await this.repository.findByIdForUser(accountId, userId);
    if (!account) {
      throw new Error('Account not found');
    }
    return this.sync.syncAccount(account.id);
  }

  async syncAll() {
    return this.sync.syncAllConnected();
  }

  async getCurrentPrice(userId, accountId, symbol) {
    const account = await this.repository.findByIdForUser(accountId, userId);
    if (!account) {
      throw new Error('Account not found');
    }
    return this.sync.getCurrentPrice(account.id, symbol);
  }

  async getSymbolSpecification(userId, accountId, symbol) {
    const account = await this.repository.findByIdForUser(accountId, userId);
    if (!account) {
      throw new Error('Account not found');
    }
    return this.sync.getSymbolSpecification(account.id, symbol);
  }
}
module.exports = AccountSyncService;
module.exports.AccountSyncService = AccountSyncService;
