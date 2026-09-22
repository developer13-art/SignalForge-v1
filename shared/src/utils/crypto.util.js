/**
 * Crypto Utilities
 *
 * Provides encryption, decryption, and cryptographic helpers used for
 * protecting sensitive data such as broker credentials, Telegram session
 * tokens, and identity documents at rest.
 *
 * @module @signalforge/shared/utils/crypto
 */

import crypto from 'node:crypto';

const DEFAULT_CIPHER = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;

const PBKDF2_ITERATIONS = 100000;
const PBKDF2_KEY_LENGTH = 64;
const PBKDF2_DIGEST = 'sha512';
const SALT_LENGTH = 32;

export function deriveKey(password, salt, iterations = PBKDF2_ITERATIONS, keyLength = KEY_LENGTH) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password is required');
  }
  if (!salt || !Buffer.isBuffer(salt)) {
    throw new Error('Salt must be a buffer');
  }
  return crypto.pbkdf2Sync(password, salt, iterations, keyLength, PBKDF2_DIGEST);
}

export function generateSalt(length = SALT_LENGTH) {
  return crypto.randomBytes(length);
}

export function generateKey() {
  return crypto.randomBytes(KEY_LENGTH);
}

export function parseKey(key) {
  if (Buffer.isBuffer(key)) {
    if (key.length !== KEY_LENGTH) {
      throw new Error(`Key must be ${KEY_LENGTH} bytes`);
    }
    return key;
  }

  if (typeof key === 'string') {
    let buffer;
    if (/^[a-f0-9]{64}$/i.test(key)) {
      buffer = Buffer.from(key, 'hex');
    } else {
      buffer = Buffer.from(key, 'base64');
    }
    if (buffer.length !== KEY_LENGTH) {
      throw new Error(`Key must decode to ${KEY_LENGTH} bytes`);
    }
    return buffer;
  }

  throw new Error('Key must be a buffer or string');
}

export function encrypt(plaintext, key) {
  if (typeof plaintext !== 'string') {
    throw new Error('Plaintext must be a string');
  }

  const keyBuffer = parseKey(key);
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(DEFAULT_CIPHER, keyBuffer, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return {
    ciphertext: encrypted.toString('base64'),
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    algorithm: DEFAULT_CIPHER,
  };
}

export function decrypt(encryptedPayload, key) {
  if (!encryptedPayload || typeof encryptedPayload !== 'object') {
    throw new Error('Encrypted payload must be an object');
  }

  const { ciphertext, iv, authTag, algorithm } = encryptedPayload;

  if (!ciphertext || !iv || !authTag) {
    throw new Error('Encrypted payload is missing required fields');
  }

  if (algorithm && algorithm !== DEFAULT_CIPHER) {
    throw new Error(`Unsupported algorithm: ${algorithm}`);
  }

  const keyBuffer = parseKey(key);
  const ivBuffer = Buffer.from(iv, 'base64');
  const authTagBuffer = Buffer.from(authTag, 'base64');
  const ciphertextBuffer = Buffer.from(ciphertext, 'base64');

  const decipher = crypto.createDecipheriv(DEFAULT_CIPHER, keyBuffer, ivBuffer, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  decipher.setAuthTag(authTagBuffer);

  const decrypted = Buffer.concat([
    decipher.update(ciphertextBuffer),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

export function encryptObject(object, key) {
  const serialized = JSON.stringify(object);
  return encrypt(serialized, key);
}

export function decryptObject(encryptedPayload, key) {
  const serialized = decrypt(encryptedPayload, key);
  return JSON.parse(serialized);
}

export function packEncrypted(encryptedPayload) {
  if (!encryptedPayload || typeof encryptedPayload !== 'object') {
    throw new Error('Encrypted payload must be an object');
  }
  const { ciphertext, iv, authTag, algorithm } = encryptedPayload;
  const components = [algorithm || DEFAULT_CIPHER, iv, authTag, ciphertext];
  return components.join('.');
}

export function unpackEncrypted(packed) {
  if (typeof packed !== 'string') {
    throw new Error('Packed encrypted data must be a string');
  }
  const parts = packed.split('.');
  if (parts.length !== 4) {
    throw new Error('Packed encrypted data must have 4 components');
  }
  const [algorithm, iv, authTag, ciphertext] = parts;
  return { algorithm, iv, authTag, ciphertext };
}

export function encryptPacked(plaintext, key) {
  const encrypted = encrypt(plaintext, key);
  return packEncrypted(encrypted);
}

export function decryptPacked(packed, key) {
  const encrypted = unpackEncrypted(packed);
  return decrypt(encrypted, key);
}

export function generateSecureToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64url');
}

export function constantTimeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }
  if (a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export function hashPassword(password, salt = null) {
  const saltBuffer = salt ? Buffer.from(salt, 'base64') : generateSalt(16);
  const derived = crypto.scryptSync(password, saltBuffer, 64);
  return {
    hash: derived.toString('base64'),
    salt: saltBuffer.toString('base64'),
  };
}

export function verifyPassword(password, hash, salt) {
  const saltBuffer = Buffer.from(salt, 'base64');
  const derived = crypto.scryptSync(password, saltBuffer, 64);
  const derivedBase64 = derived.toString('base64');

  if (derivedBase64.length !== hash.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(derivedBase64),
    Buffer.from(hash),
  );
}

export const CRYPTO_CONSTRAINTS = Object.freeze({
  defaultCipher: DEFAULT_CIPHER,
  ivLength: IV_LENGTH,
  authTagLength: AUTH_TAG_LENGTH,
  keyLength: KEY_LENGTH,
  saltLength: SALT_LENGTH,
  pbkdf2Iterations: PBKDF2_ITERATIONS,
});