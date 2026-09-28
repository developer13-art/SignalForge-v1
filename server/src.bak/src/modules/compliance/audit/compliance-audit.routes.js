/**
 * Compliance Audit Routes
 *
 * @module server/modules/compliance/audit/compliance-audit.routes
 */
const { Router } = require('express');
const { complianceAuditService } = require('./compliance-audit.service');
const { asyncHandler } = require('../../../lib/async-handler');
const { successResponse } = require('../../../lib/response/success.response');
const { paginatedResponse } = require('../../../lib/response/paginated.response');

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { page, limit, actorId, action, resourceType, resourceId, from, to } = req.query;

    const result = await complianceAuditService.listEntries({
      filters: { actorId, action, resourceType, resourceId, from, to },
      pagination: { page, limit },
    });

    return paginatedResponse(res, { items: result.items, meta: result.meta });
  }),
);

router.get(
  '/resources/:resourceType/:resourceId',
  asyncHandler(async (req, res) => {
    const entries = await complianceAuditService.listByResource({
      resourceType: req.params.resourceType,
      resourceId: req.params.resourceId,
    });
    return successResponse(res, { entries });
  }),
);

router.get(
  '/actors/:actorId/summary',
  asyncHandler(async (req, res) => {
    const summary = await complianceAuditService.getActorSummary({
      actorId: req.params.actorId,
      since: req.query.since,
    });
    return successResponse(res, { summary });
  }),
);
module.exports = router;