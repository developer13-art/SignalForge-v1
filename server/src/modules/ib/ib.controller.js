/**
 * IB Controller
 *
 * HTTP handlers for Introducing Broker operations: dashboard, links,
 * referrals, and revenue.
 *
 * @module server/modules/ib/ib.controller
 */

import { AppError } from '../../lib/errors/app-error';
import { ERROR_CODES } from '../../lib/errors/error-codes';
import { logger } from '../../lib/logger';
import { successResponse } from '../../lib/response/success.response';
import { paginatedResponse } from '../../lib/response/paginated.response';
import { ibService } from './ib.service';

export async function getDashboard(req, res) {
  const userId = req.user && req.user.id;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const dashboard = await ibService.getDashboard({ userId });

  return successResponse(res, { dashboard });
}

export async function listLinks(req, res) {
  const userId = req.user && req.user.id;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const links = await ibService.listLinks({ userId });

  return successResponse(res, { links });
}

export async function createLink(req, res) {
  const userId = req.user && req.user.id;
  const { brokerId, label, destination } = req.body || {};

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const link = await ibService.createLink({ userId, brokerId, label, destination });

  logger.info({ userId, linkId: link.linkId }, 'IB link created');

  return successResponse(res, { link }, 201);
}

export async function deactivateLink(req, res) {
  const userId = req.user && req.user.id;
  const { linkId } = req.params;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const result = await ibService.deactivateLink({ userId, linkId });

  return successResponse(res, result);
}

export async function listReferrals(req, res) {
  const userId = req.user && req.user.id;
  const { page, limit, status } = req.query;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const result = await ibService.listReferrals({
    userId,
    filters: { status },
    pagination: { page, limit },
  });

  return paginatedResponse(res, {
    items: result.items,
    meta: result.meta,
  });
}

export async function getRevenue(req, res) {
  const userId = req.user && req.user.id;
  const { from, to } = req.query;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const revenue = await ibService.getRevenue({ userId, from, to });

  return successResponse(res, { revenue });
}

export async function listRevenueEntries(req, res) {
  const userId = req.user && req.user.id;
  const { page, limit, from, to } = req.query;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const result = await ibService.listRevenueEntries({
    userId,
    filters: { from, to },
    pagination: { page, limit },
  });

  return paginatedResponse(res, {
    items: result.items,
    meta: result.meta,
  });
}

export const ibController = {
  getDashboard,
  listLinks,
  createLink,
  deactivateLink,
  listReferrals,
  getRevenue,
  listRevenueEntries,
};