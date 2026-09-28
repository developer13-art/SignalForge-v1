/**
 * Referral Wallet Repository
 *
 * @module signalforge/server/modules/referrals/wallets/repository
 */

import { ReferralRepository } from '../referral.repository.js';

export class ReferralWalletRepository {
  constructor(db = null) {
    this.referralRepository = new ReferralRepository(db);
  }

  async create(data) {
    return this.referralRepository.createWallet(data);
  }

  async findByUser(userId, currency) {
    return this.referralRepository.findWalletByUser(userId, currency);
  }

  async findById(walletId) {
    return this.referralRepository.findWalletById(walletId);
  }

  async update(walletId, data) {
    return this.referralRepository.updateWallet(walletId, data);
  }

  async computeBalance(walletId) {
    return this.referralRepository.computeWalletBalance(walletId);
  }
}

export default ReferralWalletRepository;