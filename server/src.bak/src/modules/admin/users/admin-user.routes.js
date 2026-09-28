/**
 * Admin User Routes
 *
 * Express routes for administrative user management.
 *
 * @module server/modules/admin/users/admin-user.routes
 */
const { Router } = require('express');
const { adminUserService } = require('./admin-user.service');
const { asyncHandler } = require('../../../lib/async-handler');
const { successResponse } = require('../../../lib/response/success.response');
const { paginatedResponse } = require('../../../lib/response/paginated.response');
const { adminService } = require('../admin.service');

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { page, limit, status, kycStatus, email, from, to } = req.query;

    const result = await adminUserService.listUsers({
      filters: { status, kycStatus, email, from, to },
      pagination: { page, limit },
    });

    return paginatedResponse(res, { items: result.items, meta: result.meta });
  }),
);

router.get(
  '/status-breakdown',
  asyncHandler(async (req, res) => {
    const breakdown = await adminUserService.getStatusBreakdown();
    return successResponse(res, { breakdown });
  }),
);

router.get(
  '/:userId',
  asyncHandler(async (req, res) => {
    const user = await adminUserService.getUserDetails({ userId: req.params.userId });
    return successResponse(res, { user });
  }),
);

router.post(
  '/:userId/suspend',
  asyncHandler(async (req, res) => {
    const adminId = req.user.id;
    const result = await adminUserService.suspendUser({
      userId: req.params.userId,
      adminId,
      reason: req.body ? req.body.reason : null,
    });
    return successResponse(res, result);
  }),
);

router.post(
  '/:userId/activate',
  asyncHandler(async (req, res) => {
    const adminId = req.user.id;
    const result = await adminUserService.activateUser({
      userId: req.params.userId,
      adminId,
    });
    return successResponse(res, result);
  }),
);

router.post(
  '/:userId/deactivate',
  asyncHandler(async (req, res) => {
    const adminId = req.user.id;
    const result = await adminUserService.deactivateUser({
      userId: req.params.userId,
      adminId,
      reason: req.body ? req.body.reason : null,
    });
    return successResponse(res, result);
  }),
);

router.post(
  '/:userId/revoke-sessions',
  asyncHandler(async (req, res) => {
    const adminId = req.user.id;
    const result = await adminUserService.revokeUserSessions({
      userId: req.params.userId,
      adminId,
    });
    return successResponse(res, result);
  }),
);
module.exports = router;