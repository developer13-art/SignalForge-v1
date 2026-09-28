/**
 * Verification Provider Service
 *
 * Business logic for KYC verification provider registration. Providers
 * are stored in the database and resolved at runtime by the KYC
 * abstraction layer.
 *
 * @module server/modules/compliance/verification-providers/verification-provider.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { VERIFICATION_PROVIDER_TYPE_VALUES } from '../compliance.constants';
import * as repository from './verification-provider.repository';

function sanitizeConfig(config) {
  if (!config || typeof config !== 'object') {
    return null;
  }

  const sensitiveKeys = ['apiKey', 'secretKey', 'password', 'privateKey'];
  const sanitized = { ...config };

  for (const key of sensitiveKeys) {
    if (key in sanitized) {
      sanitized[key] = '***REDACTED***';
    }
  }

  return sanitized;
}

export async function createProvider({ code, label, type, config, active, priority }) {
  if (!code || !label || !type) {
    throw new AppError('code, label, and type are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!VERIFICATION_PROVIDER_TYPE_VALUES.includes(type)) {
    throw new AppError(`Invalid provider type: ${type}`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const normalizedCode = String(code).trim().toUpperCase();

  const existing = await repository.findByCode({ code: normalizedCode });

  if (existing) {
    throw new AppError('A verification provider with this code already exists', ERROR_CODES.CONFLICT, 409);
  }

  const record = await repository.insertProvider({
    code: normalizedCode,
    label,
    type,
    config,
    active,
    priority,
  });

  logger.info({ providerId: record.id, code: record.code }, 'Verification provider created');

  return {
    providerId: record.id,
    code: record.code,
    label: record.label,
    type: record.type,
    config: record.config ? sanitizeConfig(JSON.parse(record.config)) : null,
    active: record.active,
    priority: record.priority,
  };
}

export async function listProviders({ activeOnly = true } = {}) {
  const rows = await repository.listAll({ activeOnly });

  return rows.map((row) => ({
    providerId: row.id,
    code: row.code,
    label: row.label,
    type: row.type,
    config: row.config ? sanitizeConfig(JSON.parse(row.config)) : null,
    active: row.active,
    priority: row.priority,
  }));
}

export async function getProviderById({ providerId }) {
  if (!providerId) {
    throw new AppError('providerId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const record = await repository.findById({ providerId });

  if (!record) {
    throw new AppError('Verification provider not found', ERROR_CODES.NOT_FOUND, 404);
  }

  return {
    providerId: record.id,
    code: record.code,
    label: record.label,
    type: record.type,
    config: record.config ? sanitizeConfig(JSON.parse(record.config)) : null,
    active: record.active,
    priority: record.priority,
  };
}

export async function getActiveProviderByType({ type }) {
  if (!type) {
    throw new AppError('type is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const rows = await repository.listAll({ activeOnly: true });

  const record = rows.find((r) => r.type === type);

  if (!record) {
    return null;
  }

  return {
    providerId: record.id,
    code: record.code,
    label: record.label,
    type: record.type,
    config: record.config ? JSON.parse(record.config) : null,
    priority: record.priority,
  };
}

export async function updateProvider({ providerId, label, type, config, active, priority }) {
  if (!providerId) {
    throw new AppError('providerId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (type && !VERIFICATION_PROVIDER_TYPE_VALUES.includes(type)) {
    throw new AppError(`Invalid provider type: ${type}`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const record = await repository.updateProvider({
    providerId,
    label,
    type,
    config,
    active,
    priority,
  });

  if (!record) {
    throw new AppError('Verification provider not found', ERROR_CODES.NOT_FOUND, 404);
  }

  return {
    providerId: record.id,
    code: record.code,
    label: record.label,
    type: record.type,
    active: record.active,
    priority: record.priority,
  };
}

export async function deleteProvider({ providerId }) {
  if (!providerId) {
    throw new AppError('providerId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const deleted = await repository.deleteProvider({ providerId });

  if (!deleted) {
    throw new AppError('Verification provider not found', ERROR_CODES.NOT_FOUND, 404);
  }

  logger.info({ providerId }, 'Verification provider deleted');

  return { deleted: true };
}

export const verificationProviderService = {
  createProvider,
  listProviders,
  getProviderById,
  getActiveProviderByType,
  updateProvider,
  deleteProvider,
};