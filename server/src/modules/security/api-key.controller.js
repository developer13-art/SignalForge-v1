/**
 * API Key Controller
 *
 * @module server/modules/security/api-key.controller
 */

import { AppError } from '../../lib/errors/app-error';
import { ERROR_CODES } from '../../lib/errors/error-codes';
import { successResponse } from '../../lib/response/success.response';
import { apiKeyService } from './api-key.service';

export async function listApiKeys(req, res) {
  const userId = req.user && req.user.id;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const keys = await apiKeyService.listApiKeys({ userId });

  return successResponse(res, { apiKeys: keys });
}

export async function createApiKey(req, res) {
  const userId = req.user && req.user.id;
  const { name, permissions, expiresAt } = req.body || {};

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const apiKey = await apiKeyService.createApiKey({
    userId,
    name,
    permissions,
    expiresAt,
  });

  return successResponse(res, { apiKey }, 201);
}

export async function revokeApiKey(req, res) {
  const userId = req.user && req.user.id;
  const { apiKeyId } = req.params;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const result = await apiKeyService.revokeApiKey({ apiKeyId, userId });

  return successResponse(res, result);
}

export async function deleteApiKey(req, res) {
  const userId = req.user && req.user.id;
  const { apiKeyId } = req.params;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const result = await apiKeyService.deleteApiKey({ apiKeyId, userId });

  return successResponse(res, result);
}

export const apiKeyController = {
  listApiKeys,
  createApiKey,
  revokeApiKey,
  deleteApiKey,
};