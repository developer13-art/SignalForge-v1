/**
 * Validation Unit Tests
 *
 * @module server/tests/unit/validation.test
 */

import { describe, test, expect } from '@jest/globals';
import { isValidEmail, normalizeEmail } from '@signalforge/shared/validators/email.validator';
import { isValidSolanaAddress } from '@signalforge/shared/validators/wallet-address.validator';

describe('Email validator', () => {
  test('valid emails pass', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('a.b+tag@sub.example.co.uk')).toBe(true);
  });

  test('invalid emails fail', () => {
    expect(isValidEmail('notanemail')).toBe(false);
    expect(isValidEmail('a@')).toBe(false);
  });

  test('normalizeEmail lowercases and trims', () => {
    expect(normalizeEmail('  TEST@Example.COM  ')).toBe('test@example.com');
  });
});

describe('Solana address validator', () => {
  test('valid base58 address passes', () => {
    const valid = '11111111111111111111111111111111';
    expect(isValidSolanaAddress(valid)).toBe(true);
  });
});