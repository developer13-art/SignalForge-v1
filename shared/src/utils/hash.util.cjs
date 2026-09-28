/**
 * Hash Utilities
 *
 * Provides deterministic hashing functions used across the SignalForge
 * platform for signal fingerprints, provenance hashes, idempotency keys,
 * and integrity checks.
 *
 * @module @signalforge/shared/utils/hash
 */const crypto = require('node:crypto');
const DEFAULT_HASH_ALGORITHM = 'sha256';
const DEFAULT_ENCODING = 'hex';function sha256(input) {
  return crypto
    .createHash('sha256')
    .update(typeof input === 'string' ? input : JSON.stringify(input))
    .digest('hex');
}function sha512(input) {
  return crypto
    .createHash('sha512')
    .update(typeof input === 'string' ? input : JSON.stringify(input))
    .digest('hex');
}function md5(input) {
  return crypto
    .createHash('md5')
    .update(typeof input === 'string' ? input : JSON.stringify(input))
    .digest('hex');
}function hmac(input, secret, algorithm = DEFAULT_HASH_ALGORITHM) {
  if (!secret || typeof secret !== 'string') {
    throw new Error('HMAC secret is required');
  }
  return crypto
    .createHmac(algorithm, secret)
    .update(typeof input === 'string' ? input : JSON.stringify(input))
    .digest(DEFAULT_ENCODING);
}function hashObject(obj, algorithm = DEFAULT_HASH_ALGORITHM) {
  if (obj === null || obj === undefined) {
    throw new Error('Cannot hash null or undefined');
  }
  const canonical = canonicalize(obj);
  return crypto
    .createHash(algorithm)
    .update(canonical)
    .digest(DEFAULT_ENCODING);
}function canonicalize(value) {
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
}function hashWithSalt(input, salt) {
  if (!salt || typeof salt !== 'string') {
    throw new Error('Salt is required');
  }
  return crypto
    .createHash(DEFAULT_HASH_ALGORITHM)
    .update(`${salt}:${typeof input === 'string' ? input : JSON.stringify(input)}`)
    .digest(DEFAULT_ENCODING);
}function verifyHash(input, expectedHash, algorithm = DEFAULT_HASH_ALGORITHM) {
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
}function hashToBase64(input, algorithm = DEFAULT_HASH_ALGORITHM) {
  return crypto
    .createHash(algorithm)
    .update(typeof input === 'string' ? input : JSON.stringify(input))
    .digest('base64');
}function hashToBase64Url(input, algorithm = DEFAULT_HASH_ALGORITHM) {
  return crypto
    .createHash(algorithm)
    .update(typeof input === 'string' ? input : JSON.stringify(input))
    .digest('base64url');
}function randomHex(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}function randomBase64Url(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64url');
}function generateUuid() {
  return crypto.randomUUID();
}const HASH_ALGORITHMS = Object.freeze({
  SHA256: 'sha256',
  SHA512: 'sha512',
  MD5: 'md5',
  SHA1: 'sha1',
});const HASH_CONSTRAINTS = Object.freeze({
  defaultAlgorithm: DEFAULT_HASH_ALGORITHM,
  defaultEncoding: DEFAULT_ENCODING,
  sha256Length: 64,
  sha512Length: 128,
});

module.exports.sha256 = sha256;
module.exports.sha512 = sha512;
module.exports.md5 = md5;
module.exports.hmac = hmac;
module.exports.hashObject = hashObject;
module.exports.canonicalize = canonicalize;
module.exports.hashWithSalt = hashWithSalt;
module.exports.verifyHash = verifyHash;
module.exports.hashToBase64 = hashToBase64;
module.exports.hashToBase64Url = hashToBase64Url;
module.exports.randomHex = randomHex;
module.exports.randomBase64Url = randomBase64Url;
module.exports.generateUuid = generateUuid;
module.exports.crypto = crypto;
module.exports.DEFAULT_HASH_ALGORITHM = DEFAULT_HASH_ALGORITHM;
module.exports.DEFAULT_ENCODING = DEFAULT_ENCODING;
module.exports.HASH_ALGORITHMS = HASH_ALGORITHMS;
module.exports.HASH_CONSTRAINTS = HASH_CONSTRAINTS;
