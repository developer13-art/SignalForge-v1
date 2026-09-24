/**
 * Referral Ledger Service
 *
 * @module signalforge/server/modules/referrals/ledger/service
 */

import { ReferralLedgerRepository } from './repository.js';
import { ReferralLedgerEntryService } from './entry-service.js';

export class ReferralLedgerService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new ReferralLedgerRepository();
    this.entries =
      dependencies.entries ||
      new ReferralLedgerEntryService(this.repository);
  }

  async createRewardCredit(data) {
    return this.entries.createRewardCredit(data);
  }

  async createWithdrawalDebit(data) {
    return this.entries.createWithdrawalDebit(data);
  }

  async createReversalEntry(data) {
    return this.entries.createReversalEntry(data);
  }

  async getEntry(entryId) {
    const entry = await this.repository.findById(entryId);
    return entry ? this.serialize(entry) : null;
  }

  async listEntries(walletId, filters, pagination) {
    const result = await this.repository.list(walletId, filters, pagination);
    return {
      entries: result.entries.map((e) => this.serialize(e)),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    };
  }

  async getBalance(walletId) {
    return this.repository.computeBalance(walletId);
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      walletId: row.wallet_id,
      userId: row.user_id,
      entryType: row.entry_type,
      direction: row.direction,
      amount: row.amount,
      currency: row.currency,
      balanceBefore: row.balance_before,
      balanceAfter: row.balance_after,
      referenceType: row.reference_type,
      referenceId: row.reference_id,
      description: row.description,
      relatedEntryId: row.related_entry_id,
      isReversal: row.is_reversal,
      reversalOfEntryId: row.reversal_of_entry_id,
      actorId: row.actor_id,
      actorType: row.actor_type,
      status: row.status,
      metadata: row.metadata,
      recordedAt: row.recorded_at,
      createdAt: row.created_at,
    };
  }
}

export default ReferralLedgerService;