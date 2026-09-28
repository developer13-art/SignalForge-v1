/**
 * Affiliate Controller
 *
 * HTTP handlers for affiliate operations including dashboard, links,
 * referrals, commissions, and withdrawals.
 *
 * @module server/modules/affiliate/affiliate.controller
 */

import { AppError } from '../../lib/errors/app-error';
import { ERROR_CODES } from '../../lib/errors/error-codes';
import { logger } from '../../lib/logger';
import { successResponse } from '../../lib/response/success.response';
import { paginatedResponse } from '../../lib/response/paginated.response';
import { affiliateService } from './affiliate.service';

export async function getDashboard(req, res) {
  const userId = req.user && req.user.id;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const dashboard = await affiliateService.getDashboard({ userId });

  return successResponse(res, { dashboard });
}

export async function listLinks(req, res) {
  const userId = req.user && req.user.id;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const links = await affiliateService.listLinks({ userId });

  return successResponse(res, { links });
}

export async function createLink(req, res) {
  const userId = req.user && req.user.id;
  const { label, destination } = req.body || {};

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const link = await affiliateService.createLink({ userId, label, destination });

  logger.info({ userId, linkId: link.linkId }, 'Affiliate link created');

  return successResponse(res, { link }, 201);
}

export async function deactivateLink(req, res) {
  const userId = req.user && req.user.id;
  const { linkId } = req.params;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const result = await affiliateService.deactivateLink({ userId, linkId });

  return successResponse(res, result);
}

export async function listReferrals(req, res) {
  const userId = req.user && req.user.id;
  const { page, limit, status } = req.query;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const result = await affiliateService.listReferrals({
    userId,
    filters: { status },
    pagination: { page, limit },
  });

  return paginatedResponse(res, {
    items: result.items,
    meta: result.meta,
  });
}

export async function listCommissions(req, res) {
  const userId = req.user && req.user.id;
  const { page, limit, status, from, to } = req.query;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const result = await affiliateService.listCommissions({
    userId,
    filters: { status, from, to },
    pagination: { page, limit },
  });

  return paginatedResponse(res, {
    items: result.items,
    meta: result.meta,
  });
}

export async function getCommissionSummary(req, res) {
  const userId = req.user && req.user.id;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const summary = await affiliateService.getCommissionSummary({ userId });

  return successResponse(res, { summary });
}

export async function requestWithdrawal(req, res) {
  const userId = req.user && req.user.id;
  const { amount, method, notes } = req.body || {};

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const withdrawal = await affiliateService.requestWithdrawal({
    userId,
    amount,
    method,
    notes,
  });

  logger.info({ userId, withdrawalId: withdrawal.withdrawalId }, 'Affiliate withdrawal requested');

  return successResponse(res, { withdrawal }, 201);
}

export async function listWithdrawals(req, res) {
  const userId = req.user && req.user.id;
  const { page, limit, status } = req.query;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const result = await affiliateService.listWithdrawals({
    userId,
    filters: { status },
    pagination: { page, limit },
  });

  return paginatedResponse(res, {
    items: result.items,
    meta: result.meta,
  });
}

export const affiliateController = {
  getDashboard,
  listLinks,
  createLink,
  deactivateLink,
  listReferrals,
  listCommissions,
  getCommissionSummary,
  requestWithdrawal,
  listWithdrawals,
};