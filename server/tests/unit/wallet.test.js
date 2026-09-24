/**
 * Wallet Unit Tests
 *
 * @module server/tests/unit/wallet.test
 */

import { describe, test, expect } from '@jest/globals';

function applyLedgerEntry({ balance, entryType, amount }) {
  const isCredit = ['WALLET_CREDIT', 'REFERRAL_REWARD_CREDIT'].includes(entryType);
  const isDebit = ['WALLET_DEBIT', 'REFERRAL_WITHDRAWAL_DEBIT'].includes(entryType);

  if (isCredit) {
    return balance + amount;
  }
  if (isDebit) {
    return balance - amount;
  }
  return balance;
}

describe('Ledger balance application', () => {
  test('credit increases balance', () => {
    expect(applyLedgerEntry({ balance: 100, entryType: 'WALLET_CREDIT', amount: 50 })).toBe(150);
  });

  test('debit decreases balance', () => {
    expect(applyLedgerEntry({ balance: 100, entryType: 'WALLET_DEBIT', amount: 30 })).toBe(70);
  });
});