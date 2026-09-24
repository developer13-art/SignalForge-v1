/**
 * Referral Wallet Calculator Service
 *
 * @module signalforge/server/modules/referrals/wallets/calculator
 */

export class ReferralWalletCalculatorService {
  computeTotal(balances) {
    const pending = Number(balances.pending || 0);
    const available = Number(balances.available || 0);
    return Number((pending + available).toFixed(8));
  }

  applyRewardPending(currentBalances, amount) {
    const pending = Number(currentBalances.pending || 0) + Number(amount);
    return {
      pending: Number(pending.toFixed(8)),
      available: Number(currentBalances.available || 0),
      total: this.computeTotal({ pending, available: currentBalances.available || 0 }),
    };
  }

  applySettlement(currentBalances, amount) {
    const pending = Math.max(0, Number(currentBalances.pending || 0) - Number(amount));
    const available = Number(currentBalances.available || 0) + Number(amount);
    return {
      pending: Number(pending.toFixed(8)),
      available: Number(available.toFixed(8)),
      total: this.computeTotal({ pending, available }),
    };
  }

  applyWithdrawal(currentBalances, amount) {
    const available = Math.max(0, Number(currentBalances.available || 0) - Number(amount));
    return {
      pending: Number(currentBalances.pending || 0),
      available: Number(available.toFixed(8)),
      total: this.computeTotal({
        pending: currentBalances.pending || 0,
        available,
      }),
    };
  }

  applyReversal(currentBalances, amount) {
    const pending = Math.max(0, Number(currentBalances.pending || 0) - Number(amount));
    const available = Math.max(0, Number(currentBalances.available || 0) - Number(amount));
    return {
      pending: Number(pending.toFixed(8)),
      available: Number(available.toFixed(8)),
      total: this.computeTotal({ pending, available }),
    };
  }

  canWithdraw(currentBalances, amount) {
    return Number(currentBalances.available || 0) >= Number(amount);
  }
}

export default ReferralWalletCalculatorService;