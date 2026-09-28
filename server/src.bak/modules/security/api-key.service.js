/**
 * API Key Service
 *
 * Manages creation, verification, and revocation of API keys. Keys
 * are hashed before storage; only the prefix is stored in plaintext
 * for lookup.
 *
 * @module server/modules/security/api-key.service
 */

import crypto from 'node:crypto';
import { AppError } from '../../lib/errors/app-error';
import { ERROR_CODES } from '../../lib/errors/error-codes';
import { logger } from '../../lib/logger';
import { sha256 } from '@signalforge/shared/utils/hash.util';
import * as repository from './api-key.repository';

const KEY_PREFIX_LENGTH = 12;
const KEY_BODY_LENGTH = 32;

function generateRawKey() {
  const prefix = `sf_${crypto.randomBytes(KEY_PREFIX_LENGTH / 2).toString('hex')}`;
  const body = crypto.randomBytes(KEY_BODY_LENGTH).toString('base64url');
  return { prefix, rawKey: `${prefix}.${body}` };
}

function hashKey({ rawKey }) {
  return sha256(rawKey);
}

export async function createApiKey({ userId, name, permissions, expiresAt }) {
  if (!userId || !name) {
    throw new AppError('userId and name are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { prefix, rawKey } = generateRawKey();
  const hashedKey = hashKey({ rawKey });

  const record = await repository.insertApiKey({
    userId,
    name,
    prefix,
    hashedKey,
    permissions,
    expiresAt,
  });

  logger.info({ userId, apiKeyId: record.id, prefix }, 'API key created');

  return {
    apiKeyId: record.id,
    name: record.name,
    prefix: record.key_prefix,
    rawKey,
    permissions: permissions || [],
    expiresAt: record.expires_at,
    createdAt: record.created_at,
    notice: 'Store this key securely. It will not be shown again.',
  };
}

export async function listApiKeys({ userId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const rows = await repository.listByUser({ userId });

  return rows.map((row) => ({
    apiKeyId: row.id,
    name: row.name,
    prefix: row.key_prefix,
    permissions: row.permissions ? JSON.parse(row.permissions) : [],
    active: row.active,
    expiresAt: row.expires_at,
    lastUsedAt: row.last_used_at,
    createdAt: row.created_at,
  }));
}

export async function verifyApiKey({ rawKey }) {
  if (!rawKey || typeof rawKey !== 'string') {
    return { valid: false, reason: 'MISSING_KEY' };
  }

  const dotIndex = rawKey.indexOf('.');

  if (dotIndex === -1) {
    return { valid: false, reason: 'MALFORMED_KEY' };
  }

  const prefix = rawKey.substring(0, dotIndex);

  const record = await repository.findByPrefix({ prefix });

  if (!record) {
    return { valid: false, reason: 'NOT_FOUND' };
  }

  if (!record.active) {
    return { valid: false, reason: 'REVOKED' };
  }

  if (record.expires_at && new Date(record.expires_at).getTime() < Date.now()) {
    return { valid: false, reason: 'EXPIRED' };
  }

  const providedHash = hashKey({ rawKey });

  const a = Buffer.from(providedHash, 'hex');
  const b = Buffer.from(record.hashed_key, 'hex');

  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { valid: false, reason: 'INVALID_KEY' };
  }

  await repository.touchLastUsed({ apiKeyId: record.id }).catch((err) =>
    logger.warn({ err }, 'Failed to touch API key last_used_at'),
  );

  return {
    valid: true,
    apiKeyId: record.id,
    userId: record.user_id,
    permissions: record.permissions ? JSON.parse(record.permissions) : [],
  };
}

export async function revokeApiKey({ apiKeyId, userId }) {
  if (!apiKeyId) {
    throw new AppError('apiKeyId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const record = await repository.findById({ apiKeyId });

  if (!record) {
    throw new AppError('API key not found', ERROR_CODES.NOT_FOUND, 404);
  }

  if (userId && record.user_id !== userId) {
    throw new AppError('API key does not belong to the requesting user', ERROR_CODES.AUTHORIZATION_FAILED, 403);
  }

  await repository.revokeApiKey({ apiKeyId });

  logger.info({ apiKeyId, userId: record.user_id }, 'API key revoked');

  return { revoked: true };
}

export async function deleteApiKey({ apiKeyId, userId }) {
  if (!apiKeyId || !userId) {
    throw new AppError('apiKeyId and userId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const deleted = await repository.deleteApiKey({ apiKeyId, userId });

  if (!deleted) {
    throw new AppError('API key not found', ERROR_CODES.NOT_FOUND, 404);
  }

  return { deleted: true };
}

export async function hasPermission({ apiKeyPermissions, required }) {
  if (!Array.isArray(apiKeyPermissions)) {
    return false;
  }
  if (apiKeyPermissions.includes('*')) {
    return true;
  }
  return apiKeyPermissions.includes(required);
}

export const apiKeyService = {
  createApiKey,
  listApiKeys,
  verifyApiKey,
  revokeApiKey,
  deleteApiKey,
  hasPermission,
};