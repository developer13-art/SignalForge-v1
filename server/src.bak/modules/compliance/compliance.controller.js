/**
 * Compliance Controller
 *
 * HTTP handlers for compliance-wide operations.
 *
 * @module server/modules/compliance/compliance.controller
 */

import { AppError } from '../../lib/errors/app-error';
import { ERROR_CODES } from '../../lib/errors/error-codes';
import { successResponse } from '../../lib/response/success.response';
import { complianceService } from './compliance.service';

export async function getDashboard(req, res) {
  const userId = req.user && req.user.id;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  await complianceService.assertReviewerAccess({ userId });

  const dashboard = await complianceService.getComplianceDashboard({ since: req.query.since });

  return successResponse(res, { dashboard });
}

export async function getSlaBreaches(req, res) {
  const userId = req.user && req.user.id;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  await complianceService.assertReviewerAccess({ userId });

  const breaches = await complianceService.getSlaBreaches({
    hours: req.query.hours ? Number(req.query.hours) : 48,
    limit: req.query.limit ? Number(req.query.limit) : 100,
  });

  return successResponse(res, { breaches });
}

export const complianceController = {
  getDashboard,
  getSlaBreaches,
};