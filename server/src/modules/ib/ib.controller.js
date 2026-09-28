/**
 * IB Controller
 *
 * HTTP handlers for Introducing Broker operations: dashboard, links,
 * referrals, and revenue.
 *
 * @module server/modules/ib/ib.controller
 */
const { AppError } = require('../../lib/errors/app-error');
const { ERROR_CODES } = require('../../lib/errors/error-codes');
const { logger } = require('../../lib/logger');
const { successResponse } = require('../../lib/response/success.response');
const { paginatedResponse } = require('../../lib/response/paginated.response');
const { ibService } = require('./ib.service');
async function getDashboard(req, res) {
  const userId = req.user && req.user.id;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const dashboard = await ibService.getDashboard({ userId });

  return successResponse(res, { dashboard });
}
async function listLinks(req, res) {
  const userId = req.user && req.user.id;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const links = await ibService.listLinks({ userId });

  return successResponse(res, { links });
}
async function createLink(req, res) {
  const userId = req.user && req.user.id;
  const { brokerId, label, destination } = req.body || {};

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const link = await ibService.createLink({ userId, brokerId, label, destination });

  logger.info({ userId, linkId: link.linkId }, 'IB link created');

  return successResponse(res, { link }, 201);
}
async function deactivateLink(req, res) {
  const userId = req.user && req.user.id;
  const { linkId } = req.params;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const result = await ibService.deactivateLink({ userId, linkId });

  return successResponse(res, result);
}
async function listReferrals(req, res) {
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
async function getRevenue(req, res) {
  const userId = req.user && req.user.id;
  const { from, to } = req.query;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const revenue = await ibService.getRevenue({ userId, from, to });

  return successResponse(res, { revenue });
}
async function listRevenueEntries(req, res) {
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
const ibController = {
  getDashboard,
  listLinks,
  createLink,
  deactivateLink,
  listReferrals,
  getRevenue,
  listRevenueEntries,
};
module.exports.ibController = ibController;

module.exports.getDashboard = getDashboard;

module.exports.listLinks = listLinks;

module.exports.createLink = createLink;

module.exports.deactivateLink = deactivateLink;

module.exports.listReferrals = listReferrals;

module.exports.getRevenue = getRevenue;

module.exports.listRevenueEntries = listRevenueEntries;
