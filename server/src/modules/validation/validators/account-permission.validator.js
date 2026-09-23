/**
 * Account Permission Check
 *
 * @module signalforge/server/modules/validation/validators/account-permission
 */

import { VALIDATION_RESULTS, VALIDATION_CHECK_NAMES } from '../validation.constants.js';

export class AccountPermissionCheck {
  constructor() {
    this.name = VALIDATION_CHECK_NAMES.ACCOUNT_PERMISSION;
  }

  async run(signal, context = {}) {
    const account = context.brokerAccount;
    if (!account) {
      return {
        name: this.name,
        result: VALIDATION_RESULTS.WARNING,
        reason: 'Broker account is not available in context',
      };
    }

    if (account.status !== 'CONNECTED') {
      return {
        name: this.name,
        result: VALIDATION_RESULTS.FAILED,
        reason: `Broker account is not connected (status: ${account.status})`,
      };
    }

    const symbol = signal.symbol || signal.normalizedSymbol;
    if (Array.isArray(account.disabled_symbols) && account.disabled_symbols.includes(symbol)) {
      return {
        name: this.name,
        result: VALIDATION_RESULTS.FAILED,
        reason: `Symbol ${symbol} is disabled on this account`,
      };
    }

    if (account.account_type === 'DEMO' && context.requireLive) {
      return {
        name: this.name,
        result: VALIDATION_RESULTS.FAILED,
        reason: 'Live account is required',
      };
    }

    return { name: this.name, result: VALIDATION_RESULTS.PASSED };
  }
}

export default AccountPermissionCheck;