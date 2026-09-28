/**
 * Hash Utilities
 *
 * @module server/utils/hash.util
 */
const crypto = require('node:crypto');
const { canonicalize, hashObject: sharedHashObject } = require('@signalforge/shared/utils/hash.util');
function sha256(value) {
  return crypto
    .createHash('sha256')
    .update(typeof value === 'string' ? value : JSON.stringify(value))
    .digest('hex');
}
function sha512(value) {
  return crypto
    .createHash('sha512')
    .update(typeof value === 'string' ? value : JSON.stringify(value))
    .digest('hex');
}
function hashObject(obj) {
  return sharedHashObject(obj);
}
function hashWithSalt(value, salt) {
  return crypto
    .createHash('sha256')
    .update(`${salt}:${typeof value === 'string' ? value : JSON.stringify(value)}`)
    .digest('hex');
}
function verifyHash(value, expected, algorithm = 'sha256') {
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
function hashToBase64Url(value, algorithm = 'sha256') {
  return crypto
    .createHash(algorithm)
    .update(typeof value === 'string' ? value : JSON.stringify(value))
    .digest('base64url');
}

const hashUtil = {
  sha256,
  sha512,
  hashObject,
  hashWithSalt,
  verifyHash,
  hashToBase64Url,
  canonicalize,
};
module.exports.hashUtil = hashUtil;
module.exports.sha256 = sha256;
module.exports.sha512 = sha512;
module.exports.hashObject = hashObject;
module.exports.hashWithSalt = hashWithSalt;
module.exports.verifyHash = verifyHash;
module.exports.hashToBase64Url = hashToBase64Url;
