/**
 * Wallet Service (facade)
 *
 * @module signalforge/server/modules/wallets/service
 */

import { WalletRepository } from './wallet.repository.js';
import { LedgerService } from './ledger/ledger.service.js';
import { BalanceService } from './balance/balance.service.js';
import { BalanceCalculatorService } from './balance/calculator.js';
import {
  WALLET_STATUSES,
  WALLET_TYPES,
  LEDGER_ENTRY_DIRECTIONS,
  LEDGER_ENTRY_STATUSES,
} from './wallet.constants.js';
import {
  WalletNotFoundError,
  WalletAlreadyExistsError,
  WalletNotActiveError,
  InsufficientBalanceError,
  InvalidTransactionAmountError,
} from './wallet.errors.js';
import {
  emitWalletCreated,
  emitWalletUpdated,
  emitWalletFrozen,
  emitWalletUnfrozen,
  emitWalletCredited,
  emitWalletDebited,
  emitInsufficientBalance,
} from './wallet.events.js';

export class WalletService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new WalletRepository();
    this.ledger =
      dependencies.ledger ||
      new LedgerService({ entryRepository: dependencies.entryRepository });
    this.balanceCalculator =
      dependencies.balanceCalculator || new BalanceCalculatorService();
    this.balances =
      dependencies.balances ||
      new BalanceService(dependencies.balanceRepository, this.balanceCalculator);
  }

  async ensureWallet(userId, walletType = 'USER', currency = 'USD') {
    let wallet = await this.repository.findByUserAndType(userId, walletType, currency);
    if (wallet) {
      return this.serialize(wallet);
    }
    wallet = await this.repository.create({
      userId,
      walletType,
      currency,
      status: WALLET_STATUSES.ACTIVE,
    });
    if (!wallet) {
      const existing = await this.repository.findByUserAndType(userId, walletType, currency);
      return this.serialize(existing);
    }
    await emitWalletCreated(userId, wallet.id, walletType);
    return this.serialize(wallet);
  }

  async getWallet(userId, walletId) {
    const wallet = await this.repository.findByIdForUser(walletId, userId);
    if (!wallet) {
      throw new WalletNotFoundError();
    }
    return this.serialize(wallet);
  }

  async getWalletByType(userId, walletType, currency = 'USD') {
    const wallet = await this.repository.findByUserAndType(userId, walletType, currency);
    if (!wallet) {
      return this.ensureWallet(userId, walletType, currency);
    }
    return this.serialize(wallet);
  }

  async listWallets(userId, filters = {}) {
    const rows = await this.repository.listForUser(userId, filters);
    return rows.map((row) => this.serialize(row));
  }

  async creditWallet(walletId, amount, meta = {}) {
    this.assertPositiveAmount(amount);

    const wallet = await this.repository.findById(walletId);
    if (!wallet) {
      throw new WalletNotFoundError();
    }
    if (wallet.status !== WALLET_STATUSES.ACTIVE && wallet.status !== WALLET_STATUSES.FROZEN) {
      throw new WalletNotActiveError(undefined, { status: wallet.status });
    }

    const currentBalances = {
      available: Number(wallet.available_balance || 0),
      pending: Number(wallet.pending_balance || 0),
      reserved: Number(wallet.reserved_balance || 0),
    };
    const next = this.balanceCalculator.applyCredit(currentBalances, amount);

    const updated = await this.repository.update(wallet.id, {
      availableBalance: next.available,
      totalBalance: next.total,
      lifetimeCredited: Number(wallet.lifetime_credited || 0) + Number(amount),
    });

    const entry = await this.ledger.createEntry({
      walletId: wallet.id,
      userId: wallet.user_id,
      entryType: meta.entryType || 'WALLET_CREDIT',
      direction: LEDGER_ENTRY_DIRECTIONS.CREDIT,
      amount,
      currency: wallet.currency,
      balanceBefore: Number(wallet.total_balance || 0),
      balanceAfter: next.total,
      referenceType: meta.referenceType || null,
      referenceId: meta.referenceId || null,
      description: meta.description || null,
      actorId: meta.actorId || null,
      actorType: meta.actorType || 'SYSTEM',
      status: LEDGER_ENTRY_STATUSES.POSTED,
      metadata: meta.metadata || null,
    });

    await emitWalletCredited(wallet.user_id, wallet.id, amount, next.total, {
      entryId: entry.id,
      referenceType: meta.referenceType || null,
      referenceId: meta.referenceId || null,
    });

    return {
      wallet: this.serialize(updated),
      entry: this.ledger.entries.serialize(entry),
    };
  }

  async debitWallet(walletId, amount, meta = {}) {
    this.assertPositiveAmount(amount);

    const wallet = await this.repository.findById(walletId);
    if (!wallet) {
      throw new WalletNotFoundError();
    }
    if (wallet.status !== WALLET_STATUSES.ACTIVE) {
      throw new WalletNotActiveError(undefined, { status: wallet.status });
    }

    const available = Number(wallet.available_balance || 0);
    if (available < Number(amount)) {
      await emitInsufficientBalance(wallet.user_id, wallet.id, amount, available);
      throw new InsufficientBalanceError(undefined, {
        requested: amount,
        available,
      });
    }

    const currentBalances = {
      available,
      pending: Number(wallet.pending_balance || 0),
      reserved: Number(wallet.reserved_balance || 0),
    };
    const next = this.balanceCalculator.applyDebit(currentBalances, amount);

    const updated = await this.repository.update(wallet.id, {
      availableBalance: next.available,
      totalBalance: next.total,
      lifetimeDebited: Number(wallet.lifetime_debited || 0) + Number(amount),
    });

    const entry = await this.ledger.createEntry({
      walletId: wallet.id,
      userId: wallet.user_id,
      entryType: meta.entryType || 'WALLET_DEBIT',
      direction: LEDGER_ENTRY_DIRECTIONS.DEBIT,
      amount,
      currency: wallet.currency,
      balanceBefore: Number(wallet.total_balance || 0),
      balanceAfter: next.total,
      referenceType: meta.referenceType || null,
      referenceId: meta.referenceId || null,
      description: meta.description || null,
      actorId: meta.actorId || null,
      actorType: meta.actorType || 'SYSTEM',
      status: LEDGER_ENTRY_STATUSES.POSTED,
      metadata: meta.metadata || null,
    });

    await emitWalletDebited(wallet.user_id, wallet.id, amount, next.total, {
      entryId: entry.id,
      referenceType: meta.referenceType || null,
      referenceId: meta.referenceId || null,
    });

    return {
      wallet: this.serialize(updated),
      entry: this.ledger.entries.serialize(entry),
    };
  }

  async creditUserWallet(userId, amount, meta = {}) {
    const wallet = await this.ensureWallet(userId, meta.walletType || 'USER', meta.currency || 'USD');
    return this.creditWallet(wallet.id, amount, meta);
  }

  async debitUserWallet(userId, amount, meta = {}) {
    const wallet = await this.ensureWallet(userId, meta.walletType || 'USER', meta.currency || 'USD');
    return this.debitWallet(wallet.id, amount, meta);
  }

  async freezeWallet(walletId, reason) {
    const wallet = await this.repository.findById(walletId);
    if (!wallet) {
      throw new WalletNotFoundError();
    }
    await this.repository.update(wallet.id, {
      status: WALLET_STATUSES.FROZEN,
      frozenReason: reason || null,
    });
    await emitWalletFrozen(wallet.user_id, wallet.id, reason);
    const updated = await this.repository.findById(wallet.id);
    return this.serialize(updated);
  }

  async unfreezeWallet(walletId) {
    const wallet = await this.repository.findById(walletId);
    if (!wallet) {
      throw new WalletNotFoundError();
    }
    await this.repository.update(wallet.id, {
      status: WALLET_STATUSES.ACTIVE,
      frozenReason: null,
    });
    await emitWalletUnfrozen(wallet.user_id, wallet.id);
    const updated = await this.repository.findById(wallet.id);
    return this.serialize(updated);
  }

  async listLedgerEntries(userId, filters = {}, pagination = {}) {
    return this.ledger.listEntriesByUser(userId, filters, pagination);
  }

  async listWalletLedgerEntries(walletId, filters = {}, pagination = {}) {
    return this.ledger.listEntriesByWallet(walletId, filters, pagination);
  }

  async getLedgerEntry(entryId) {
    return this.ledger.getEntry(entryId);
  }

  async reverseLedgerEntry(entryId, actorId, reason) {
    const reversal = await this.ledger.reverseEntry(entryId, actorId, reason);
    const entry = await this.ledger.getEntry(entryId);
    return { reversal, reversedEntry: entry };
  }

  async checkIntegrity(walletId, tolerance) {
    return this.ledger.checkIntegrity(walletId, tolerance);
  }

  async checkAllIntegrity(tolerance) {
    return this.ledger.checkAllIntegrity(tolerance);
  }

  async recomputeBalance(walletId) {
    const computed = await this.balances.recomputeFromLedger(walletId);
    const wallet = await this.repository.findById(walletId);
    if (!wallet) {
      throw new WalletNotFoundError();
    }
    const previousBalance = Number(wallet.total_balance || 0);
    await this.repository.update(wallet.id, {
      availableBalance: computed.netBalance,
      totalBalance: computed.netBalance,
    });
    await emitWalletUpdated(wallet.user_id, wallet.id, ['balances']);
    return {
      walletId: wallet.id,
      previousBalance,
      newBalance: computed.netBalance,
      difference: Number((computed.netBalance - previousBalance).toFixed(4)),
    };
  }

  assertPositiveAmount(amount) {
    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
      throw new InvalidTransactionAmountError(undefined, { amount });
    }
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      userId: row.user_id,
      providerId: row.provider_id,
      walletType: row.wallet_type,
      currency: row.currency,
      status: row.status,
      availableBalance: Number(row.available_balance || 0),
      pendingBalance: Number(row.pending_balance || 0),
      reservedBalance: Number(row.reserved_balance || 0),
      totalBalance: Number(row.total_balance || 0),
      lifetimeCredited: Number(row.lifetime_credited || 0),
      lifetimeDebited: Number(row.lifetime_debited || 0),
      frozenReason: row.frozen_reason,
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

export { WALLET_TYPES };

export default WalletService;