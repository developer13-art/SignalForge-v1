/**
 * Withdrawal Method Interface
 *
 * @module signalforge/server/modules/withdrawals/methods/interface
 */

export class WithdrawalMethodInterface {
  constructor(name) {
    this.name = name;
  }

  supports(methodType) {
    return false;
  }

  async validateAccountDetails(details) {
    return { valid: true, errors: [] };
  }

  async processPayout(request, account) {
    throw new Error(`${this.name} must implement processPayout()`);
  }

  calculateFee(amount, account) {
    return 0;
  }
}

export default WithdrawalMethodInterface;