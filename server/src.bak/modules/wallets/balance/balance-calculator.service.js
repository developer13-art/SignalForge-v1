/**
 * Balance Calculator Service
 *
 * @module signalforge/server/modules/wallets/balance/calculator
 */

import { BalanceCalculationError } from '../wallet.errors.js';

export class BalanceCalculatorService {
  computeTotal(balances) {
    if (!balances || typeof balances !== 'object') {
      throw new BalanceCalculationError('Balances must be an object');
    }
    const available = Number(balances.available || 0);
    const pending = Number(balances.pending || 0);
    const reserved = Number(balances.reserved || 0);
    return Number((available + pending + reserved).toFixed(4));
  }

  applyCredit(currentBalances, amount) {
    const available = Number(currentBalances.available || 0) + Number(amount);
    const pending = Number(currentBalances.pending || 0);
    const reserved = Number(currentBalances.reserved || 0);
    return {
      available: Number(available.toFixed(4)),
      pending: Number(pending.toFixed(4)),
      reserved: Number(reserved.toFixed(4)),
      total: this.computeTotal({ available, pending, reserved }),
    };
  }

  applyDebit(currentBalances, amount) {
    const available = Number(currentBalances.available || 0) - Number(amount);
    const pending = Number(currentBalances.pending || 0);
    const reserved = Number(currentBalances.reserved || 0);
    return {
      available: Number(available.toFixed(4)),
      pending: Number(pending.toFixed(4)),
      reserved: Number(reserved.toFixed(4)),
      total: this.computeTotal({ available, pending, reserved }),
    };
  }

  applyReservation(currentBalances, amount) {
    const available = Number(currentBalances.available || 0) - Number(amount);
    const reserved = Number(currentBalances.reserved || 0) + Number(amount);
    return {
      available: Number(available.toFixed(4)),
      pending: Number(currentBalances.pending || 0),
      reserved: Number(reserved.toFixed(4)),
      total: this.computeTotal({
        available,
        pending: currentBalances.pending || 0,
        reserved,
      }),
    };
  }

  applyRelease(currentBalances, amount) {
    const available = Number(currentBalances.available || 0) + Number(amount);
    const reserved = Number(currentBalances.reserved || 0) - Number(amount);
    return {
      available: Number(available.toFixed(4)),
      pending: Number(currentBalances.pending || 0),
      reserved: Number(reserved.toFixed(4)),
      total: this.computeTotal({
        available,
        pending: currentBalances.pending || 0,
        reserved,
      }),
    };
  }

  canDebit(currentBalances, amount) {
    const available = Number(currentBalances.available || 0);
    return available >= Number(amount);
  }
}

export default BalanceCalculatorService;