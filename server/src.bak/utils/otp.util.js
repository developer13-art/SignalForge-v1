/**
 * OTP Utilities
 *
 * @module server/utils/otp.util
 */

import crypto from 'node:crypto';

const DEFAULT_LENGTH = 6;
const DEFAULT_TTL_MINUTES = 15;

export function generateNumericOtp(length = DEFAULT_LENGTH) {
  if (!Number.isInteger(length) || length < 4 || length > 10) {
    throw new Error('OTP length must be between 4 and 10');
  }

  const max = Math.pow(10, length);
  const value = crypto.randomInt(0, max);

  return String(value).padStart(length, '0');
}

export function generateAlphanumericOtp(length = 8) {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.randomBytes(length * 2);
  let result = '';

  for (let i = 0; i < bytes.length && result.length < length; i++) {
    const byte = bytes[i];
    if (byte < 256 - (256 % charset.length)) {
      result += charset[byte % charset.length];
    }
  }

  return result;
}

export function computeExpiry({ ttlMinutes = DEFAULT_TTL_MINUTES } = {}) {
  return new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString();
}

export function isExpired(expiresAt) {
  if (!expiresAt) {
    return false;
  }
  return new Date(expiresAt).getTime() < Date.now();
}

export function hashOtp(otp) {
  return crypto.createHash('sha256').update(String(otp)).digest('hex');
}

export function verifyOtpHash(otp, expectedHash) {
  const actual = hashOtp(otp);
  if (actual.length !== expectedHash.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(actual, 'hex'), Buffer.from(expectedHash, 'hex'));
}

export const otpUtil = {
  generateNumericOtp,
  generateAlphanumericOtp,
  computeExpiry,
  isExpired,
  hashOtp,
  verifyOtpHash,
  DEFAULT_LENGTH,
  DEFAULT_TTL_MINUTES,
};