/**
 * Hash Utilities
 *
 * Provides deterministic hashing functions used across the SignalForge
 * platform for signal fingerprints, provenance hashes, idempotency keys,
 * and integrity checks.
 *
 * @module @signalforge/shared/utils/hash
 */

import crypto from 'node:crypto';

const DEFAULT_HASH_ALGORITHM = 'sha256';
const DEFAULT_ENCODING = 'hex';

export function sha256(input) {
  return crypto
    .createHash('sha256')
    .update(typeof input === 'string' ? input : JSON.stringify(input))
    .digest('hex');
}

export function sha512(input) {
  return crypto
    .createHash('sha512')
    .update(typeof input === 'string' ? input : JSON.stringify(input))
    .digest('hex');
}

export function md5(input) {
  return crypto
    .createHash('md5')
    .update(typeof input === 'string' ? input : JSON.stringify(input))
    .digest('hex');
}

export function hmac(input, secret, algorithm = DEFAULT_HASH_ALGORITHM) {
  if (!secret || typeof secret !== 'string') {
    throw new Error('HMAC secret is required');
  }
  return crypto
    .createHmac(algorithm, secret)
    .update(typeof input === 'string' ? input : JSON.stringify(input))
    .digest(DEFAULT_ENCODING);
}

export function hashObject(obj, algorithm = DEFAULT_HASH_ALGORITHM) {
  if (obj === null || obj === undefined) {
    throw new Error('Cannot hash null or undefined');
  }
  const canonical = canonicalize(obj);
  return crypto
    .createHash(algorithm)
    .update(canonical)
    .digest(DEFAULT_ENCODING);
}

export function canonicalize(value) {
  if (value === null || value === undefined) {
    return 'null';
  }

  if (typeof value === 'string') {
    return JSON.stringify(value);
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      return 'null';
    }
    return String(value);
  }

  if (typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    const items = value.map((item) => canonicalize(item));
    return `[${items.join(',')}]`;
  }

  if (typeof value === 'object') {
    const keys = Object.keys(value).sort();
    const pairs = keys.map(
      (key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`,
    );
    return `{${pairs.join(',')}}`;
  }

  return 'null';
}

export function hashWithSalt(input, salt) {
  if (!salt || typeof salt !== 'string') {
    throw new Error('Salt is required');
  }
  return crypto
    .createHash(DEFAULT_HASH_ALGORITHM)
    .update(`${salt}:${typeof input === 'string' ? input : JSON.stringify(input)}`)
    .digest(DEFAULT_ENCODING);
}

export function verifyHash(input, expectedHash, algorithm = DEFAULT_HASH_ALGORITHM) {
  const actualHash = crypto
    .createHash(algorithm)
    .update(typeof input === 'string' ? input : JSON.stringify(input))
    .digest(DEFAULT_ENCODING);

  if (actualHash.length !== expectedHash.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(actualHash, DEFAULT_ENCODING),
    Buffer.from(expectedHash, DEFAULT_ENCODING),
  );
}

export function hashToBase64(input, algorithm = DEFAULT_HASH_ALGORITHM) {
  return crypto
    .createHash(algorithm)
    .update(typeof input === 'string' ? input : JSON.stringify(input))
    .digest('base64');
}

export function hashToBase64Url(input, algorithm = DEFAULT_HASH_ALGORITHM) {
  return crypto
    .createHash(algorithm)
    .update(typeof input === 'string' ? input : JSON.stringify(input))
    .digest('base64url');
}

export function randomHex(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

export function randomBase64Url(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64url');
}

export function generateUuid() {
  return crypto.randomUUID();
}

export const HASH_ALGORITHMS = Object.freeze({
  SHA256: 'sha256',
  SHA512: 'sha512',
  MD5: 'md5',
  SHA1: 'sha1',
});

export const HASH_CONSTRAINTS = Object.freeze({
  defaultAlgorithm: DEFAULT_HASH_ALGORITHM,
  defaultEncoding: DEFAULT_ENCODING,
  sha256Length: 64,
  sha512Length: 128,
});