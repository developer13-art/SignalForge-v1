/**
 * Auth Unit Tests
 *
 * @module server/tests/unit/auth.test
 */

import { describe, test, expect } from '@jest/globals';
import { hashPassword, verifyPassword, generatePassword } from '../../src/utils/password.util';
import { signAccessToken, verifyAccessToken } from '../../src/utils/jwt.util';
import { generateNumericOtp, hashOtp, verifyOtpHash } from '../../src/utils/otp.util';

describe('Password utilities', () => {
  test('hashPassword and verifyPassword round-trip', async () => {
    const hash = await hashPassword('Test123!@#');
    expect(hash).toBeTruthy();
    const result = await verifyPassword('Test123!@#', hash);
    expect(result).toBe(true);
  });

  test('verifyPassword fails for wrong password', async () => {
    const hash = await hashPassword('Test123!@#');
    const result = await verifyPassword('WrongPassword', hash);
    expect(result).toBe(false);
  });

  test('generatePassword returns a valid string', () => {
    const pwd = generatePassword(16);
    expect(typeof pwd).toBe('string');
    expect(pwd.length).toBe(16);
  });
});

describe('JWT utilities', () => {
  test('signAccessToken and verifyAccessToken round-trip', () => {
    const token = signAccessToken({ sub: 'user-1', email: 'a@b.c' });
    expect(typeof token).toBe('string');

    const decoded = verifyAccessToken(token);
    expect(decoded.sub).toBe('user-1');
    expect(decoded.email).toBe('a@b.c');
  });
});

describe('OTP utilities', () => {
  test('generateNumericOtp produces correct length', () => {
    const otp = generateNumericOtp(6);
    expect(otp.length).toBe(6);
    expect(/^\d{6}$/.test(otp)).toBe(true);
  });

  test('hashOtp and verifyOtpHash round-trip', () => {
    const otp = '123456';
    const hash = hashOtp(otp);
    expect(verifyOtpHash(otp, hash)).toBe(true);
    expect(verifyOtpHash('654321', hash)).toBe(false);
  });
});