/**
 * Ledger Entry Repository
 *
 * @module signalforge/server/modules/wallets/ledger/entry-repository
 */

import { WalletRepository } from '../wallet.repository.js';

export class LedgerEntryRepository {
  constructor(db = null) {
    this.walletRepository = new WalletRepository(db);
  }

  async create(data) {
    return this.walletRepository.createLedgerEntry(data);
  }

  async findById(entryId) {
    return this.walletRepository.findLedgerEntryById(entryId);
  }

  async findByReference(referenceType, referenceId) {
    return this.walletRepository.findLedgerEntryByReference(referenceType, referenceId);
  }

  async listByWallet(walletId, filters, pagination) {
    return this.walletRepository.listLedgerEntries(walletId, filters, pagination);
  }

  async listByUser(userId, filters, pagination) {
    return this.walletRepository.listLedgerEntriesForUser(userId, filters, pagination);
  }

  async computeBalance(walletId) {
    return this.walletRepository.computeBalanceFromLedger(walletId);
  }

  async listWithDrift(tolerance) {
    return this.walletRepository.listWalletsWithDrift(tolerance);
  }
}

export default LedgerEntryRepository;