/**
 * Referral Ledger Repository
 *
 * @module signalforge/server/modules/referrals/ledger/repository
 */

import { ReferralRepository } from '../referral.repository.js';

export class ReferralLedgerRepository {
  constructor(db = null) {
    this.referralRepository = new ReferralRepository(db);
  }

  async create(data) {
    return this.referralRepository.createLedgerEntry(data);
  }

  async findById(entryId) {
    return this.referralRepository.findLedgerEntryById(entryId);
  }

  async list(walletId, filters, pagination) {
    return this.referralRepository.listLedgerEntries(walletId, filters, pagination);
  }

  async computeBalance(walletId) {
    return this.referralRepository.computeWalletBalance(walletId);
  }
}

export default ReferralLedgerRepository;