/**
 * Admin Controller
 *
 * HTTP handlers for platform-wide administrative operations.
 *
 * @module server/modules/admin/admin.controller
 */
const { AppError } = require('../../lib/errors/app-error');
const { ERROR_CODES } = require('../../lib/errors/error-codes');
const { successResponse } = require('../../lib/response/success.response');
const { adminService } = require('./admin.service');

export async function getPlatformOverview(req, res) {
  const adminId = req.user && req.user.id;
  const { since } = req.query;

  if (!adminId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const overview = await adminService.getPlatformOverview({ since });

  return successResponse(res, { overview });
}

export async function listAdminActions(req, res) {
  const adminId = req.user && req.user.id;
  const { limit } = req.query;

  if (!adminId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const actions = await adminService.listRecentAdminActions({
    limit: limit ? Number(limit) : 50,
  });

  return successResponse(res, { actions });
}

export async function getSystemHealth(req, res) {
  const adminId = req.user && req.user.id;

  if (!adminId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const health = await adminService.health.checkSystemHealth();

  return successResponse(res, { health });
}
const adminController = {
  getPlatformOverview,
  listAdminActions,
  getSystemHealth,
};
module.exports.adminController = adminController;
