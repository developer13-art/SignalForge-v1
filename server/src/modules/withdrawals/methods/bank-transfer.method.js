/**
 * Bank Transfer Withdrawal Method
 *
 * @module signalforge/server/modules/withdrawals/methods/bank-transfer
 */
const { WithdrawalMethodInterface } = require('./withdrawal-method.interface.js');
const { WITHDRAWAL_METHOD_TYPES } = require('../withdrawal.constants.js');
const { WithdrawalProcessingError } = require('../withdrawal.errors.js');

const FEE_PERCENT = 0.5;
const MIN_FEE = 0.5;
const MAX_FEE = 25;
class BankTransferMethod extends WithdrawalMethodInterface {
  constructor() {
    super('BANK_TRANSFER');
  }

  supports(methodType) {
    return methodType === WITHDRAWAL_METHOD_TYPES.BANK_TRANSFER;
  }

  async validateAccountDetails(details) {
    const errors = [];

    if (!details) {
      return { valid: false, errors: ['details is required'] };
    }

    if (!details.accountNumber || !/^\d{6,20}$/.test(String(details.accountNumber))) {
      errors.push('accountNumber must be 6 to 20 digits');
    }
    if (!details.bankName || typeof details.bankName !== 'string') {
      errors.push('bankName is required');
    }
    if (!details.accountName || typeof details.accountName !== 'string') {
      errors.push('accountName is required');
    }
    if (details.bankCode && typeof details.bankCode !== 'string') {
      errors.push('bankCode must be a string');
    }
    if (details.country && typeof details.country !== 'string') {
      errors.push('country must be a string');
    }

    return { valid: errors.length === 0, errors };
  }

  calculateFee(amount) {
    const numeric = Number(amount || 0);
    if (numeric <= 0) {
      return 0;
    }
    const percent = numeric * (FEE_PERCENT / 100);
    const bounded = Math.max(MIN_FEE, Math.min(MAX_FEE, percent));
    return Number(bounded.toFixed(2));
  }

  async processPayout(request, account) {
    if (!account || !account.details) {
      throw new WithdrawalProcessingError('Withdrawal account is invalid');
    }

    const reference = `bt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    return {
      processed: true,
      methodType: WITHDRAWAL_METHOD_TYPES.BANK_TRANSFER,
      externalReference: reference,
      externalTransactionId: null,
      status: 'PROCESSING',
      raw: {
        accountNumber: account.details.accountNumber,
        bankName: account.details.bankName,
        reference,
      },
    };
  }
}
module.exports = BankTransferMethod;
module.exports.BankTransferMethod = BankTransferMethod;
