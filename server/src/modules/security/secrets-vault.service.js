/**
 * Secrets Vault Service
 *
 * A thin, pluggable interface over the platform's secrets vault. The
 * default implementation uses the environment-provided master
 * encryption key. A concrete vault (AWS Secrets Manager, HashiCorp
 * Vault, etc.) can be registered at bootstrap.
 *
 * @module server/modules/security/secrets-vault.service
 */

import { AppError } from '../../lib/errors/app-error';
import { ERROR_CODES } from '../../lib/errors/error-codes';
import { logger } from '../../lib/logger';
import { config } from '../../config';
import { encryptString, decryptString } from './encryption.service';

const IN_MEMORY_VAULT = new Map();

let backend = null;

export function registerVaultBackend(impl) {
  if (!impl || typeof impl !== 'object') {
    throw new AppError('Vault backend must be an object', ERROR_CODES.VALIDATION_FAILED, 500);
  }
  if (typeof impl.get !== 'function' || typeof impl.set !== 'function') {
    throw new AppError('Vault backend must implement get() and set()', ERROR_CODES.VALIDATION_FAILED, 500);
  }
  backend = impl;
  logger.info('Custom secrets vault backend registered');
}

function validateSecretName(name) {
  if (!name || typeof name !== 'string') {
    throw new AppError('Secret name is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }
  if (!/^[A-Za-z0-9._:-]{1,128}$/.test(name)) {
    throw new AppError('Secret name contains invalid characters', ERROR_CODES.VALIDATION_FAILED, 400);
  }
}

export async function setSecret({ name, value, metadata }) {
  validateSecretName(name);

  if (value === undefined || value === null) {
    throw new AppError('Secret value is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (backend) {
    await backend.set({ name, value, metadata });
    return { stored: true, backend: 'custom' };
  }

  const encrypted = encryptString({ plaintext: String(value) });

  IN_MEMORY_VAULT.set(name, {
    encrypted,
    metadata: metadata || null,
    updatedAt: new Date().toISOString(),
  });

  return { stored: true, backend: 'in-memory' };
}

export async function getSecret({ name }) {
  validateSecretName(name);

  if (backend) {
    const value = await backend.get({ name });
    return value;
  }

  const entry = IN_MEMORY_VAULT.get(name);

  if (!entry) {
    return null;
  }

  return decryptString({ packed: entry.encrypted });
}

export async function deleteSecret({ name }) {
  validateSecretName(name);

  if (backend && typeof backend.delete === 'function') {
    await backend.delete({ name });
    return { deleted: true };
  }

  const existed = IN_MEMORY_VAULT.delete(name);
  return { deleted: existed };
}

export async function listSecretNames() {
  if (backend && typeof backend.list === 'function') {
    return backend.list();
  }
  return Array.from(IN_MEMORY_VAULT.keys());
}

export function hasSecretsMasterKey() {
  return Boolean(config.security && config.security.encryptionKey);
}

export const secretsVaultService = {
  registerVaultBackend,
  setSecret,
  getSecret,
  deleteSecret,
  listSecretNames,
  hasSecretsMasterKey,
};