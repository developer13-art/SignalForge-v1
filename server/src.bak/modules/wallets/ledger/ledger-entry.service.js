/**
 * Ledger Entry Service
 *
 * @module signalforge/server/modules/wallets/ledger/entry-service
 */

import { LedgerEntryRepository } from './ledger-entry.repository.js';
import { LedgerEntryNotFoundError, LedgerEntryAlreadyReversedError } from '../wallet.errors.js';
import {
  LEDGER_ENTRY_DIRECTIONS,
  LEDGER_ENTRY_STATUSES,
} from '../wallet.constants.js';
import {
  emitLedgerEntryCreated,
  emitLedgerReversed,
} from '../wallet.events.js';

export class LedgerEntryService {
  constructor(repository = null) {
    this.repository = repository || new LedgerEntryRepository();
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
      status: data.status || LEDGER_ENTRY_STATUSES.POSTED,
      metadata: data.metadata || null,
    });

    await emitLedgerEntryCreated(
      data.userId,
      data.walletId,
      created.id,
      created.entry_type,
      created.amount,
      created.direction,
    );

    return created;
  }

  async reverseEntry(entryId, actorId = null, reason = null) {
    const entry = await this.repository.findById(entryId);
    if (!entry) {
      throw new LedgerEntryNotFoundError();
    }
    if (entry.status === LEDGER_ENTRY_STATUSES.REVERSED) {
      throw new LedgerEntryAlreadyReversedError();
    }

    const reversalDirection =
      entry.direction === LEDGER_ENTRY_DIRECTIONS.CREDIT
        ? LEDGER_ENTRY_DIRECTIONS.DEBIT
        : LEDGER_ENTRY_DIRECTIONS.CREDIT;

    const reversal = await this.repository.create({
      walletId: entry.wallet_id,
      userId: entry.user_id,
      entryType: `REVERSAL_${entry.entry_type}`,
      direction: reversalDirection,
      amount: entry.amount,
      currency: entry.currency,
      referenceType: 'REVERSAL',
      referenceId: entry.id,
      description: reason || `Reversal of entry ${entry.id}`,
      isReversal: true,
      reversalOfEntryId: entry.id,
      actorId,
      actorType: actorId ? 'ADMIN' : 'SYSTEM',
      status: LEDGER_ENTRY_STATUSES.POSTED,
    });

    await emitLedgerReversed(entry.user_id, entry.wallet_id, entry.id, reversal.id);

    return reversal;
  }

  async getById(entryId) {
    const entry = await this.repository.findById(entryId);
    if (!entry) {
      throw new LedgerEntryNotFoundError();
    }
    return this.serialize(entry);
  }

  async listByWallet(walletId, filters, pagination) {
    const result = await this.repository.listByWallet(walletId, filters, pagination);
    return {
      entries: result.entries.map((e) => this.serialize(e)),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    };
  }

  async listByUser(userId, filters, pagination) {
    const result = await this.repository.listByUser(userId, filters, pagination);
    return {
      entries: result.entries.map((e) => this.serialize(e)),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    };
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      walletId: row.wallet_id,
      userId: row.user_id,
      entryType: row.entry_type,
      direction: row.direction,
      amount: row.amount,
      currency: row.currency,
      balanceBefore: row.balance_before,
      balanceAfter: row.balance_after,
      referenceType: row.reference_type,
      referenceId: row.reference_id,
      description: row.description,
      relatedEntryId: row.related_entry_id,
      isReversal: row.is_reversal,
      reversalOfEntryId: row.reversal_of_entry_id,
      actorId: row.actor_id,
      actorType: row.actor_type,
      status: row.status,
      metadata: this.parseJson(row.metadata),
      recordedAt: row.recorded_at,
      createdAt: row.created_at,
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

export default LedgerEntryService;