/**
 * Settings Controller
 *
 * @module server/modules/settings/settings.controller
 */
const { AppError } = require('../../lib/errors/app-error');
const { ERROR_CODES } = require('../../lib/errors/error-codes');
const { successResponse } = require('../../lib/response/success.response');
const { settingsService } = require('./settings.service');
const { validateSettingKey, validateSettingPayload } = require('./settings.validator');

function requireAdmin(req) {
  const userId = req.user && req.user.id;
  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }
  return userId;
}
async function listSettings(req, res) {
  requireAdmin(req);

  const settings = await settingsService.listSettings({ category: req.query.category });

  return successResponse(res, { settings });
}
async function listPublicSettings(req, res) {
  const settings = await settingsService.listPublicSettings();

  return successResponse(res, { settings });
}
async function getSetting(req, res) {
  requireAdmin(req);

  const key = validateSettingKey(req.params.key);

  const value = await settingsService.getSetting({ key });

  return successResponse(res, { key, value });
}
async function setSetting(req, res) {
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
async function deleteSetting(req, res) {
  const actorId = requireAdmin(req);

  const key = validateSettingKey(req.params.key);

  const result = await settingsService.deleteSetting({ key, actorId });

  return successResponse(res, result);
}
async function getBulkSettings(req, res) {
  requireAdmin(req);

  const { keys } = req.body || {};

  const settings = await settingsService.getBulkSettings({ keys });

  return successResponse(res, { settings });
}
async function getSettingsByCategories(req, res) {
  requireAdmin(req);

  const { categories } = req.body || {};

  const settings = await settingsService.getSettingsByCategories({ categories });

  return successResponse(res, { settings });
}
const settingsController = {
  listSettings,
  listPublicSettings,
  getSetting,
  setSetting,
  deleteSetting,
  getBulkSettings,
  getSettingsByCategories,
};
module.exports.settingsController = settingsController;

module.exports.listSettings = listSettings;

module.exports.listPublicSettings = listPublicSettings;

module.exports.getSetting = getSetting;

module.exports.setSetting = setSetting;

module.exports.deleteSetting = deleteSetting;

module.exports.getBulkSettings = getBulkSettings;

module.exports.getSettingsByCategories = getSettingsByCategories;
