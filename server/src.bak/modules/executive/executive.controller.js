/**
 * Executive Controller
 *
 * HTTP handlers for executive-level analytics.
 *
 * @module server/modules/executive/executive.controller
 */

import { AppError } from '../../lib/errors/app-error';
import { ERROR_CODES } from '../../lib/errors/error-codes';
import { successResponse } from '../../lib/response/success.response';
import { executiveService } from './executive.service';

function requireExecutive(req) {
  const userId = req.user && req.user.id;
  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }
  return userId;
}

export async function getDashboard(req, res) {
  requireExecutive(req);

  const { from, to } = req.query;
  const dashboard = await executiveService.getExecutiveDashboard({ from, to });

  return successResponse(res, { dashboard });
}

export async function getRevenueBreakdown(req, res) {
  requireExecutive(req);

  const { from, to } = req.query;
  const revenue = await executiveService.getRevenueBreakdown({ from, to });

  return successResponse(res, { revenue });
}

export async function getGrowthBreakdown(req, res) {
  requireExecutive(req);

  const { from, to, granularity } = req.query;
  const growth = await executiveService.getGrowthBreakdown({ from, to, granularity });

  return successResponse(res, { growth });
}

export async function getRetention(req, res) {
  requireExecutive(req);

  const { from, to } = req.query;
  const retention = await executiveService.getRetentionMetrics({ from, to });

  return successResponse(res, { retention });
}

export async function getConversion(req, res) {
  requireExecutive(req);

  const { from, to } = req.query;
  const conversion = await executiveService.getConversionMetrics({ from, to });

  return successResponse(res, { conversion });
}

export async function getFinancialReport(req, res) {
  requireExecutive(req);

  const { from, to, granularity } = req.query;
  const report = await executiveService.getFinancialReport({ from, to, granularity });

  return successResponse(res, { report });
}

export const executiveController = {
  getDashboard,
  getRevenueBreakdown,
  getGrowthBreakdown,
  getRetention,
  getConversion,
  getFinancialReport,
};