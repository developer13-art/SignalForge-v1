/**
 * Settings Controller
 *
 * @module server/modules/settings/settings.controller
 */

import { AppError } from '../../lib/errors/app-error';
import { ERROR_CODES } from '../../lib/errors/error-codes';
import { successResponse } from '../../lib/response/success.response';
import { settingsService } from './settings.service';
import { validateSettingKey, validateSettingPayload } from './settings.validator';

function requireAdmin(req) {
  const userId = req.user && req.user.id;
  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }
  return userId;
}

export async function listSettings(req, res) {
  requireAdmin(req);

  const settings = await settingsService.listSettings({ category: req.query.category });

  return successResponse(res, { settings });
}

export async function listPublicSettings(req, res) {
  const settings = await settingsService.listPublicSettings();

  return successResponse(res, { settings });
}

export async function getSetting(req, res) {
  requireAdmin(req);

  const key = validateSettingKey(req.params.key);

  const value = await settingsService.getSetting({ key });

  return successResponse(res, { key, value });
}

export async function setSetting(req, res) {
  const actorId = requireAdmin(req);

  const key = validateSettingKey(req.params.key);
  const payload = validateSettingPayload(req.body || {});

  const setting = await settingsService.setSetting({
    key,
    value: payload.value,
    valueType: payload.valueType,
    category: payload.category,
    description: payload.description,
    isPublic: payload.isPublic,
    actorId,
  });

  return successResponse(res, { setting });
}

export async function deleteSetting(req, res) {
  const actorId = requireAdmin(req);

  const key = validateSettingKey(req.params.key);

  const result = await settingsService.deleteSetting({ key, actorId });

  return successResponse(res, result);
}

export async function getBulkSettings(req, res) {
  requireAdmin(req);

  const { keys } = req.body || {};

  const settings = await settingsService.getBulkSettings({ keys });

  return successResponse(res, { settings });
}

export async function getSettingsByCategories(req, res) {
  requireAdmin(req);

  const { categories } = req.body || {};

  const settings = await settingsService.getSettingsByCategories({ categories });

  return successResponse(res, { settings });
}

export const settingsController = {
  listSettings,
  listPublicSettings,
  getSetting,
  setSetting,
  deleteSetting,
  getBulkSettings,
  getSettingsByCategories,
};