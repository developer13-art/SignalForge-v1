/**
 * Ledger Integrity Service
 *
 * @module signalforge/server/modules/wallets/ledger/integrity
 */

import { LedgerEntryRepository } from './ledger-entry.repository.js';
import { getDatabase } from '../../../bootstrap/initDatabase.js';
import { LedgerIntegrityError } from '../wallet.errors.js';
import { emitLedgerIntegrityCheck } from '../wallet.events.js';
import { getLogger } from '../../../bootstrap/initLogger.js';

const DEFAULT_TOLERANCE = 0.01;

export class LedgerIntegrityService {
  constructor(repository = null) {
    this.repository = repository || new LedgerEntryRepository();
    this.db = getDatabase();
    this.logger = getLogger('ledger-integrity');
  }

  async checkWallet(walletId, tolerance = DEFAULT_TOLERANCE) {
    const walletResult = await this.db.query(
      `SELECT id, user_id, total_balance, available_balance, pending_balance,
              reserved_balance
         FROM wallets
        WHERE id = $1
        LIMIT 1`,
      [walletId],
    );
    const wallet = walletResult.rows[0];
    if (!wallet) {
      throw new LedgerIntegrityError('Wallet not found', { walletId });
    }

    const computed = await this.repository.computeBalance(walletId);
    const difference = Number(
      (Number(wallet.total_balance) - computed.netBalance).toFixed(4),
    );

    const ok = Math.abs(difference) <= tolerance;

    const summary = {
      walletId,
      storedBalance: Number(wallet.total_balance),
      ledgerBalance: computed.netBalance,
      difference,
      entryCount: computed.entryCount,
      ok,
    };

    await emitLedgerIntegrityCheck(walletId, summary);

    if (!ok) {
      this.logger.warn({ walletId, difference }, 'Ledger integrity drift detected');
    }

    return summary;
  }

  async checkAll(tolerance = DEFAULT_TOLERANCE) {
    const drifted = await this.repository.listWithDrift(tolerance);

    const results = {
      checked: drifted.length,
      drifted: drifted.length,
      details: drifted.map((row) => ({
        walletId: row.id,
        userId: row.user_id,
        walletType: row.wallet_type,
        currency: row.currency,
        storedBalance: Number(row.total_balance),
        ledgerBalance: Number(row.ledger_balance),
        difference: Number((Number(row.total_balance) - Number(row.ledger_balance)).toFixed(4)),
      })),
    };

    return results;
  }
}

export default LedgerIntegrityService;