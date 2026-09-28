/**
 * Broker Account Snapshot Service
 *
 * @module signalforge/server/modules/brokers/accounts/snapshot
 */
const { AccountRepository } = require('./account.repository.js');
const { emitAccountSnapshot } = require('../broker.events.js');

export class AccountSnapshotService {
  constructor(repository = null) {
    this.repository = repository || new AccountRepository();
  }

  async captureSnapshot(accountId) {
    const account = await this.repository.findById(accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    const snapshot = await this.repository.createSnapshot({
      brokerAccountId: account.id,
      userId: account.user_id,
      balance: account.balance,
      equity: account.equity,
      margin: account.margin,
      freeMargin: account.free_margin,
      marginLevel: account.margin_level,
    });

    await emitAccountSnapshot(account.id, account.user_id, {
      balance: account.balance,
      equity: account.equity,
    });

    return snapshot;
  }

  async listSnapshots(accountId, filters = {}, pagination = {}) {
    return this.repository.listSnapshots(accountId, filters, pagination);
  }
}
module.exports = AccountSnapshotService;