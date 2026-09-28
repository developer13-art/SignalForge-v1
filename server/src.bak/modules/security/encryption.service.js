/**
 * Encryption Service
 *
 * Wraps the shared crypto utilities so that services can encrypt and
 * decrypt sensitive values using the configured platform encryption
 * key without managing buffers directly.
 *
 * @module server/modules/security/encryption.service
 */

import { AppError } from '../../lib/errors/app-error';
import { ERROR_CODES } from '../../lib/errors/error-codes';
import { config } from '../../config';
import {
  encryptPacked,
  decryptPacked,
  encryptObject,
  decryptObject,
  packEncrypted,
  unpackEncrypted,
} from '@signalforge/shared/utils/crypto.util';

function getKey(overrideKey) {
  const key = overrideKey || (config.security && config.security.encryptionKey);

  if (!key) {
    throw new AppError('Encryption key is not configured', ERROR_CODES.CONFIGURATION_MISSING, 500);
  }

  return key;
}

export function encryptString({ plaintext, key }) {
  if (typeof plaintext !== 'string') {
    throw new AppError('plaintext must be a string', ERROR_CODES.VALIDATION_FAILED, 400);
  }
  return encryptPacked(plaintext, getKey(key));
}

export function decryptString({ packed, key }) {
  if (typeof packed !== 'string') {
    throw new AppError('packed value must be a string', ERROR_CODES.VALIDATION_FAILED, 400);
  }
  return decryptPacked(packed, getKey(key));
}

export function encryptJson({ object, key }) {
  if (object === null || object === undefined) {
    throw new AppError('object is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }
  const encrypted = encryptObject(object, getKey(key));
  return packEncrypted(encrypted);
}

export function decryptJson({ packed, key }) {
  if (typeof packed !== 'string') {
    throw new AppError('packed value must be a string', ERROR_CODES.VALIDATION_FAILED, 400);
  }
  const encrypted = unpackEncrypted(packed);
  return decryptObject(encrypted, getKey(key));
}

export async function rotateKey({ currentKey, newKey }) {
  if (!newKey) {
    throw new AppError('newKey is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (currentKey && currentKey === newKey) {
    return { rotated: false, reason: 'SAME_KEY' };
  }

  return {
    rotated: true,
    previousKeyFingerprint: currentKey ? fingerprintKey(currentKey) : null,
    newKeyFingerprint: fingerprintKey(newKey),
  };
}

function fingerprintKey(key) {
  const str = typeof key === 'string' ? key : Buffer.isBuffer(key) ? key.toString('hex') : String(key);
  return str.substring(0, 8);
}

export const encryptionService = {
  encryptString,
  decryptString,
  encryptJson,
  decryptJson,
  rotateKey,
};