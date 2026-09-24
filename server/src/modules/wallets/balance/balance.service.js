/**
 * Balance Service
 *
 * @module signalforge/server/modules/wallets/balance/service
 */

import { BalanceRepository } from './repository.js';
import { BalanceCalculatorService } from './calculator.js';
import { WalletNotFoundError } from '../wallet.errors.js';

export class BalanceService {
  constructor(repository = null, calculator = null) {
    this.repository = repository || new BalanceRepository();
    this.calculator = calculator || new BalanceCalculatorService();
  }

  async getBalances(userId, walletType = 'USER', currency = 'USD') {
    const wallet = await this.repository.findByUserAndType(userId, walletType, currency);
    if (!wallet) {
      throw new WalletNotFoundError();
    }
    return this.serialize(wallet);
  }

  async applyCredit(walletId, amount) {
    const wallet = await this.repository.updateBalances(walletId, {});
    const current = this.toBalancesObject(wallet);
    const next = this.calculator.applyCredit(current, amount);
    await this.repository.updateBalances(walletId, {
      availableBalance: next.available,
      totalBalance: next.total,
    });
    return next;
  }

  async applyDebit(walletId, amount) {
    const wallet = await this.repository.updateBalances(walletId, {});
    const current = this.toBalancesObject(wallet);
    const next = this.calculator.applyDebit(current, amount);
    await this.repository.updateBalances(walletId, {
      availableBalance: next.available,
      totalBalance: next.total,
    });
    return next;
  }

  async recomputeFromLedger(walletId) {
    return this.repository.computeFromLedger(walletId);
  }

  toBalancesObject(wallet) {
    return {
      available: Number(wallet.available_balance || 0),
      pending: Number(wallet.pending_balance || 0),
      reserved: Number(wallet.reserved_balance || 0),
      total: Number(wallet.total_balance || 0),
    };
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      walletId: row.id,
      userId: row.user_id,
      walletType: row.wallet_type,
      currency: row.currency,
      status: row.status,
      available: Number(row.available_balance || 0),
      pending: Number(row.pending_balance || 0),
      reserved: Number(row.reserved_balance || 0),
      total: Number(row.total_balance || 0),
      lifetimeCredited: Number(row.lifetime_credited || 0),
      lifetimeDebited: Number(row.lifetime_debited || 0),
    };
  }
}

export default BalanceService;