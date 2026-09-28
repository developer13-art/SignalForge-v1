/**
 * Compliance Controller
 *
 * HTTP handlers for compliance-wide operations.
 *
 * @module server/modules/compliance/compliance.controller
 */
const { AppError } = require('../../lib/errors/app-error');
const { ERROR_CODES } = require('../../lib/errors/error-codes');
const { successResponse } = require('../../lib/response/success.response');
const { complianceService } = require('./compliance.service');

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
const complianceController = {
  getDashboard,
  getSlaBreaches,
};
module.exports.complianceController = complianceController;
