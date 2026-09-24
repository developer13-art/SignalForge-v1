/**
 * Referral Wallet Service
 *
 * @module signalforge/server/modules/referrals/wallets/service
 */

import { ReferralWalletRepository } from './repository.js';
import { ReferralWalletCalculatorService } from './calculator.js';
import {
  ReferralWalletNotFoundError,
  InsufficientReferralBalanceError,
} from '../referral.errors.js';
import {
  emitWalletCredited,
  emitWalletDebited,
  emitLedgerEntryCreated,
} from '../referral.events.js';

export class ReferralWalletService {
  constructor(repository = null, calculator = null) {
    this.repository = repository || new ReferralWalletRepository();
    this.calculator = calculator || new ReferralWalletCalculatorService();
  }

  async ensureWallet(userId, currency = 'USD') {
    let wallet = await this.repository.findByUser(userId, currency);
    if (wallet) {
      return this.serialize(wallet);
    }
    wallet = await this.repository.create({ userId, currency });
    if (!wallet) {
      const existing = await this.repository.findByUser(userId, currency);
      return this.serialize(existing);
    }
    return this.serialize(wallet);
  }

  async getWallet(userId, currency = 'USD') {
    const wallet = await this.repository.findByUser(userId, currency);
    if (!wallet) {
      throw new ReferralWalletNotFoundError();
    }
    return this.serialize(wallet);
  }

  async creditPending(userId, amount, meta = {}) {
    const wallet = await this.repository.findByUser(userId, meta.currency || 'USD');
    if (!wallet) {
      await this.ensureWallet(userId, meta.currency || 'USD');
    }
    const activeWallet = await this.repository.findByUser(userId, meta.currency || 'USD');

    const current = {
      pending: Number(activeWallet.pending_balance || 0),
      available: Number(activeWallet.available_balance || 0),
    };
    const next = this.calculator.applyRewardPending(current, amount);

    await this.repository.update(activeWallet.id, {
      pendingBalance: next.pending,
      availableBalance: next.available,
      lifetimeEarned: Number(activeWallet.lifetime_earned || 0) + Number(amount),
    });

    await emitWalletCredited(userId, activeWallet.id, amount, next.pending, {
      purpose: 'REFERRAL_REWARD_PENDING',
    });

    const updated = await this.repository.findById(activeWallet.id);
    return this.serialize(updated);
  }

  async settlePending(userId, amount, meta = {}) {
    const wallet = await this.repository.findByUser(userId, meta.currency || 'USD');
    if (!wallet) {
      throw new ReferralWalletNotFoundError();
    }

    const current = {
      pending: Number(wallet.pending_balance || 0),
      available: Number(wallet.available_balance || 0),
    };
    const next = this.calculator.applySettlement(current, amount);

    await this.repository.update(wallet.id, {
      pendingBalance: next.pending,
      availableBalance: next.available,
    });

    await emitWalletCredited(userId, wallet.id, amount, next.available, {
      purpose: 'REFERRAL_REWARD_SETTLED',
    });

    const updated = await this.repository.findById(wallet.id);
    return this.serialize(updated);
  }

  async debitForWithdrawal(userId, amount, meta = {}) {
    const wallet = await this.repository.findByUser(userId, meta.currency || 'USD');
    if (!wallet) {
      throw new ReferralWalletNotFoundError();
    }

    const current = {
      pending: Number(wallet.pending_balance || 0),
      available: Number(wallet.available_balance || 0),
    };

    if (!this.calculator.canWithdraw(current, amount)) {
      throw new InsufficientReferralBalanceError(undefined, {
        requested: amount,
        available: current.available,
      });
    }

    const next = this.calculator.applyWithdrawal(current, amount);

    await this.repository.update(wallet.id, {
      pendingBalance: next.pending,
      availableBalance: next.available,
      lifetimeWithdrawn: Number(wallet.lifetime_withdrawn || 0) + Number(amount),
    });

    await emitWalletDebited(userId, wallet.id, amount, next.available, {
      purpose: 'REFERRAL_WITHDRAWAL',
    });

    const updated = await this.repository.findById(wallet.id);
    return this.serialize(updated);
  }

  async reverse(userId, amount, meta = {}) {
    const wallet = await this.repository.findByUser(userId, meta.currency || 'USD');
    if (!wallet) {
      throw new ReferralWalletNotFoundError();
    }

    const current = {
      pending: Number(wallet.pending_balance || 0),
      available: Number(wallet.available_balance || 0),
    };
    const next = this.calculator.applyReversal(current, amount);

    await this.repository.update(wallet.id, {
      pendingBalance: next.pending,
      availableBalance: next.available,
      lifetimeReversed: Number(wallet.lifetime_reversed || 0) + Number(amount),
    });

    const updated = await this.repository.findById(wallet.id);
    return this.serialize(updated);
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      userId: row.user_id,
      currency: row.currency,
      pendingBalance: Number(row.pending_balance || 0),
      availableBalance: Number(row.available_balance || 0),
      lifetimeEarned: Number(row.lifetime_earned || 0),
      lifetimeWithdrawn: Number(row.lifetime_withdrawn || 0),
      lifetimeReversed: Number(row.lifetime_reversed || 0),
      status: row.status,
      metadata: this.parseJson(row.metadata),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  parseJson(input) {
    if (!input) {
      return null;
    }
    if (typeof input === 'string') {
      try {
        return JSON.parse(input);
      } catch {
        return null;
      }
    }
    return input;
  }
}

export { emitLedgerEntryCreated };

export default ReferralWalletService;