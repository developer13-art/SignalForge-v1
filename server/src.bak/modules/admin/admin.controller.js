/**
 * Admin Controller
 *
 * HTTP handlers for platform-wide administrative operations.
 *
 * @module server/modules/admin/admin.controller
 */

import { AppError } from '../../lib/errors/app-error';
import { ERROR_CODES } from '../../lib/errors/error-codes';
import { successResponse } from '../../lib/response/success.response';
import { adminService } from './admin.service';

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

export const adminController = {
  getPlatformOverview,
  listAdminActions,
  getSystemHealth,
};