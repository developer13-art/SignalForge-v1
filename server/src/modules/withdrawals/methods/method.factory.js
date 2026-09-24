/**
 * Withdrawal Method Factory
 *
 * @module signalforge/server/modules/withdrawals/methods/factory
 */

import { BankTransferMethod } from './bank-transfer.method.js';
import { CryptoMethod } from './crypto.method.js';
import { WITHDRAWAL_METHOD_TYPES } from '../withdrawal.constants.js';
import { WithdrawalMethodNotSupportedError } from '../withdrawal.errors.js';

const registry = new Map([
  [WITHDRAWAL_METHOD_TYPES.BANK_TRANSFER, () => new BankTransferMethod()],
  [WITHDRAWAL_METHOD_TYPES.CRYPTO, () => new CryptoMethod()],
  [WITHDRAWAL_METHOD_TYPES.PAYSTACK, () => new BankTransferMethod()],
  [WITHDRAWAL_METHOD_TYPES.STRIPE, () => new BankTransferMethod()],
]);

export class WithdrawalMethodFactory {
  static register(methodType, factory) {
    if (typeof factory !== 'function') {
      throw new Error('Withdrawal method factory must be a function');
    }
    registry.set(methodType, factory);
  }

  static create(methodType) {
    const factory = registry.get(methodType);
    if (!factory) {
      throw new WithdrawalMethodNotSupportedError(undefined, { methodType });
    }
    return factory();
  }

  static list() {
    return Array.from(registry.keys());
  }

  static isSupported(methodType) {
    return registry.has(methodType);
  }
}

export default WithdrawalMethodFactory;