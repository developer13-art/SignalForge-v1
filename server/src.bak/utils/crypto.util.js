/**
 * Crypto Utilities
 *
 * Server-side wrapper over the shared crypto utilities. Adds
 * environment-aware defaults and helpers used only by the backend.
 *
 * @module server/utils/crypto.util
 */

import crypto from 'node:crypto';
import {
  encryptPacked as sharedEncryptPacked,
  decryptPacked as sharedDecryptPacked,
  encryptObject as sharedEncryptObject,
  decryptObject as sharedDecryptObject,
  generateSecureToken,
} from '@signalforge/shared/utils/crypto.util';
import { config } from '../config';

function getKey(override) {
  const key = override || (config.security && config.security.encryptionKey);
  if (!key) {
    throw new Error('Encryption key is not configured');
  }
  return key;
}

export function encryptString(plaintext, overrideKey) {
  return sharedEncryptPacked(plaintext, getKey(overrideKey));
}

export function decryptString(packed, overrideKey) {
  return sharedDecryptPacked(packed, getKey(overrideKey));
}

export function encryptJsonObject(object, overrideKey) {
  const encrypted = sharedEncryptObject(object, getKey(overrideKey));
  return encrypted;
}

export function decryptJsonObject(encrypted, overrideKey) {
  return sharedDecryptObject(encrypted, getKey(overrideKey));
}

export function generateRandomHex(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

export function generateRandomBase64Url(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64url');
}

export function generateUuid() {
  return crypto.randomUUID();
}

export function generateSessionToken() {
  return generateSecureToken(48);
}

export function hashSha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

export function hmacSha256(value, secret) {
  return crypto.createHmac('sha256', secret).update(String(value)).digest('hex');
}

export function timingSafeEqual(a, b) {
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

export const cryptoUtil = {
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