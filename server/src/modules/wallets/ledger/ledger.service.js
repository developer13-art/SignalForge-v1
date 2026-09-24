/**
 * Ledger Service (facade)
 *
 * @module signalforge/server/modules/wallets/ledger/service
 */

import { LedgerRepository } from './repository.js';
import { LedgerEntryService } from './entry-service.js';
import { LedgerIntegrityService } from './integrity.js';

export class LedgerService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new LedgerRepository();
    this.entries =
      dependencies.entries ||
      new LedgerEntryService(dependencies.entryRepository);
    this.integrity =
      dependencies.integrity ||
      new LedgerIntegrityService(dependencies.entryRepository);
  }

  async createEntry(data) {
    return this.entries.create(data);
  }

  async reverseEntry(entryId, actorId, reason) {
    return this.entries.reverseEntry(entryId, actorId, reason);
  }

  async getEntry(entryId) {
    return this.entries.getById(entryId);
  }

  async listEntriesByWallet(walletId, filters, pagination) {
    return this.entries.listByWallet(walletId, filters, pagination);
  }

  async listEntriesByUser(userId, filters, pagination) {
    return this.entries.listByUser(userId, filters, pagination);
  }

  async checkIntegrity(walletId, tolerance) {
    return this.integrity.checkWallet(walletId, tolerance);
  }

  async checkAllIntegrity(tolerance) {
    return this.integrity.checkAll(tolerance);
  }
}

export default LedgerService;