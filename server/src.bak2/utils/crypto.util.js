/**
 * Crypto Utilities
 *
 * Server-side wrapper over the shared crypto utilities. Adds
 * environment-aware defaults and helpers used only by the backend.
 *
 * @module server/utils/crypto.util
 */
const crypto = require('node:crypto');
const { encryptPacked: sharedEncryptPacked, decryptPacked: sharedDecryptPacked, encryptObject: sharedEncryptObject, decryptObject: sharedDecryptObject, generateSecureToken } = require('@signalforge/shared/utils/crypto.util');
const { config } = require('../config');

function getKey(override) {
  const key = override || (config.security && config.security.encryptionKey);
  if (!key) {
    throw new Error('Encryption key is not configured');
  }
  return key;
}
function encryptString(plaintext, overrideKey) {
  return sharedEncryptPacked(plaintext, getKey(overrideKey));
}
function decryptString(packed, overrideKey) {
  return sharedDecryptPacked(packed, getKey(overrideKey));
}
function encryptJsonObject(object, overrideKey) {
  const encrypted = sharedEncryptObject(object, getKey(overrideKey));
  return encrypted;
}
function decryptJsonObject(encrypted, overrideKey) {
  return sharedDecryptObject(encrypted, getKey(overrideKey));
}
function generateRandomHex(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}
function generateRandomBase64Url(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64url');
}
function generateUuid() {
  return crypto.randomUUID();
}
function generateSessionToken() {
  return generateSecureToken(48);
}
function hashSha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}
function hmacSha256(value, secret) {
  return crypto.createHmac('sha256', secret).update(String(value)).digest('hex');
}
function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}
const cryptoUtil = {
  encryptString,
  decryptString,
  encryptJsonObject,
  decryptJsonObject,
  generateRandomHex,
  generateRandomBase64Url,
  generateUuid,
  generateSessionToken,
  hashSha256,
  hmacSha256,
  timingSafeEqual,
};
module.exports.cryptoUtil = cryptoUtil;
module.exports.encryptString = encryptString;
module.exports.decryptString = decryptString;
module.exports.encryptJsonObject = encryptJsonObject;
module.exports.decryptJsonObject = decryptJsonObject;
module.exports.generateRandomHex = generateRandomHex;
module.exports.generateRandomBase64Url = generateRandomBase64Url;
module.exports.generateUuid = generateUuid;
module.exports.generateSessionToken = generateSessionToken;
module.exports.hashSha256 = hashSha256;
module.exports.hmacSha256 = hmacSha256;
module.exports.timingSafeEqual = timingSafeEqual;
