/**
 * Referral Ledger Entry Service
 *
 * @module signalforge/server/modules/referrals/ledger/entry-service
 */

import { ReferralLedgerRepository } from './repository.js';
import {
  LEDGER_ENTRY_STATUSES,
  REFERRAL_LEDGER_DIRECTIONS,
} from '../referral.constants.js';
import { emitLedgerEntryCreated } from '../referral.events.js';

export class ReferralLedgerEntryService {
  constructor(repository = null) {
    this.repository = repository || new ReferralLedgerRepository();
  }

  async create(data) {
    const created = await this.repository.create({
      walletId: data.walletId,
      userId: data.userId,
      entryType: data.entryType,
      direction: data.direction,
      amount: data.amount,
      currency: data.currency || 'USD',
      balanceBefore: data.balanceBefore ?? null,
      balanceAfter: data.balanceAfter ?? null,
      referenceType: data.referenceType || null,
      referenceId: data.referenceId || null,
      description: data.description || null,
      relatedEntryId: data.relatedEntryId || null,
      isReversal: data.isReversal === true,
      reversalOfEntryId: data.reversalOfEntryId || null,
      actorId: data.actorId || null,
      actorType: data.actorType || null,
      status: data.status || 'POSTED',
      metadata: data.metadata || null,
    });

    await emitLedgerEntryCreated(
      data.userId,
      data.walletId,
      created.id,
      created.direction,
      created.amount,
    );

    return created;
  }

  async createRewardCredit(data) {
    return this.create({
      ...data,
      entryType: 'REFERRAL_REWARD_CREDIT',
      direction: REFERRAL_LEDGER_DIRECTIONS.CREDIT,
      status: LEDGER_ENTRY_STATUSES.POSTED,
    });
  }

  async createWithdrawalDebit(data) {
    return this.create({
      ...data,
      entryType: 'REFERRAL_WITHDRAWAL_DEBIT',
      direction: REFERRAL_LEDGER_DIRECTIONS.DEBIT,
      status: LEDGER_ENTRY_STATUSES.POSTED,
    });
  }

  async createReversalEntry(data) {
    return this.create({
      ...data,
      entryType: 'REFERRAL_REVERSAL_DEBIT',
      direction: REFERRAL_LEDGER_DIRECTIONS.DEBIT,
      isReversal: true,
      status: LEDGER_ENTRY_STATUSES.POSTED,
    });
  }
}

export default ReferralLedgerEntryService;