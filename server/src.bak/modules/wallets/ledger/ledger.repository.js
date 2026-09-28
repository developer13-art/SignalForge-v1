/**
 * Ledger Repository
 *
 * @module signalforge/server/modules/wallets/ledger/repository
 */

import { WalletRepository } from '../wallet.repository.js';

export class LedgerRepository {
  constructor(db = null) {
    this.walletRepository = new WalletRepository(db);
  }

  async createEntry(data) {
    return this.walletRepository.createLedgerEntry(data);
  }

  async findEntryById(entryId) {
    return this.walletRepository.findLedgerEntryById(entryId);
  }

  async listEntries(walletId, filters, pagination) {
    return this.walletRepository.listLedgerEntries(walletId, filters, pagination);
  }

  async listEntriesForUser(userId, filters, pagination) {
    return this.walletRepository.listLedgerEntriesForUser(userId, filters, pagination);
  }

  async computeBalance(walletId) {
    return this.walletRepository.computeBalanceFromLedger(walletId);
  }

  async listWalletsWithDrift(tolerance) {
    return this.walletRepository.listWalletsWithDrift(tolerance);
  }
}

export default LedgerRepository;