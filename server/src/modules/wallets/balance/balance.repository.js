/**
 * Balance Repository
 *
 * @module signalforge/server/modules/wallets/balance/repository
 */

import { WalletRepository } from '../wallet.repository.js';

export class BalanceRepository {
  constructor(db = null) {
    this.walletRepository = new WalletRepository(db);
  }

  async findByUserAndType(userId, walletType, currency) {
    return this.walletRepository.findByUserAndType(userId, walletType, currency);
  }

  async updateBalances(walletId, balances) {
    return this.walletRepository.update(walletId, balances);
  }

  async computeFromLedger(walletId) {
    return this.walletRepository.computeBalanceFromLedger(walletId);
  }

  async sumByType(walletType, currency) {
    return this.walletRepository.sumByWalletType(walletType, currency);
  }
}

export default BalanceRepository;