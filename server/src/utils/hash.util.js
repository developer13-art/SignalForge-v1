/**
 * Hash Utilities
 *
 * @module server/utils/hash.util
 */

import crypto from 'node:crypto';
import { canonicalize, hashObject as sharedHashObject } from '@signalforge/shared/utils/hash.util';

export function sha256(value) {
  return crypto
    .createHash('sha256')
    .update(typeof value === 'string' ? value : JSON.stringify(value))
    .digest('hex');
}

export function sha512(value) {
  return crypto
    .createHash('sha512')
    .update(typeof value === 'string' ? value : JSON.stringify(value))
    .digest('hex');
}

export function hashObject(obj) {
  return sharedHashObject(obj);
}

export function hashWithSalt(value, salt) {
  return crypto
    .createHash('sha256')
    .update(`${salt}:${typeof value === 'string' ? value : JSON.stringify(value)}`)
    .digest('hex');
}

export function verifyHash(value, expected, algorithm = 'sha256') {
  const actual = crypto
    .createHash(algorithm)
    .update(typeof value === 'string' ? value : JSON.stringify(value))
    .digest('hex');

  if (actual.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(actual, 'hex'),
    Buffer.from(expected, 'hex'),
  );
}

export function hashToBase64Url(value, algorithm = 'sha256') {
  return crypto
    .createHash(algorithm)
    .update(typeof value === 'string' ? value : JSON.stringify(value))
    .digest('base64url');
}

export { canonicalize };

export const hashUtil = {
  sha256,
  sha512,
  hashObject,
  hashWithSalt,
  verifyHash,
  hashToBase64Url,
  canonicalize,
};