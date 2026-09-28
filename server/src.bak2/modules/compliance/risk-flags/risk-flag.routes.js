/**
 * Risk Flag Routes
 *
 * @module server/modules/compliance/risk-flags/risk-flag.routes
 */
const { Router } = require('express');
const { riskFlagService } = require('./risk-flag.service');
const { asyncHandler } = require('../../../lib/async-handler');
const { successResponse } = require('../../../lib/response/success.response');
const { paginatedResponse } = require('../../../lib/response/paginated.response');

const router = Router();

router.get(
  '/open',
  asyncHandler(async (req, res) => {
    const { page, limit, severity, flagType, userId } = req.query;

    const result = await riskFlagService.listOpenFlags({
      filters: { severity, flagType, userId },
      pagination: { page, limit },
    });

    return paginatedResponse(res, { items: result.items, meta: result.meta });
  }),
);

router.get(
  '/severity-breakdown',
  asyncHandler(async (req, res) => {
    const breakdown = await riskFlagService.getSeverityBreakdown();
    return successResponse(res, { breakdown });
  }),
);

router.get(
  '/applications/:applicationId',
  asyncHandler(async (req, res) => {
    const flags = await riskFlagService.listFlagsForApplication({
      applicationId: req.params.applicationId,
    });
    return successResponse(res, { flags });
  }),
);

router.get(
  '/:flagId',
  asyncHandler(async (req, res) => {
    const flag = await riskFlagService.getFlagById({ flagId: req.params.flagId });
    return successResponse(res, { flag });
  }),
);

router.post(
  '/:flagId/resolve',
  asyncHandler(async (req, res) => {
    const resolvedBy = req.user.id;
    const { resolutionNotes } = req.body || {};

    const result = await riskFlagService.resolveFlag({
      flagId: req.params.flagId,
      resolvedBy,
      resolutionNotes,
    });

    return successResponse(res, result);
  }),
);
module.exports = router;