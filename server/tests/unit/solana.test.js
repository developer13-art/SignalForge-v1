/**
 * Solana Unit Tests
 *
 * @module server/tests/unit/solana.test
 */

import { describe, test, expect } from '@jest/globals';
import { isValidSolanaAddress } from '@signalforge/shared/validators/wallet-address.validator';
import { isValidTxSignature } from '@signalforge/shared/validators/tx-signature.validator';

describe('Solana validators', () => {
  test('valid base58 wallet address passes', () => {
    const address = '11111111111111111111111111111111';
    expect(isValidSolanaAddress(address)).toBe(true);
  });

  test('invalid wallet address fails', () => {
    expect(isValidSolanaAddress('not-a-wallet')).toBe(false);
    expect(isValidSolanaAddress('')).toBe(false);
  });

  test('valid-looking tx signature is accepted', () => {
    const sig = 'x'.repeat(88).replace(/x/g, '3');
    expect(isValidTxSignature(sig)).toBe(true);
  });
});