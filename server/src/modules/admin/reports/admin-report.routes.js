/**
 * Admin Report Routes
 *
 * Express routes for admin reporting and exports.
 *
 * @module server/modules/admin/reports/admin-report.routes
 */

import { Router } from 'express';
import { adminReportService } from './admin-report.service';
import { asyncHandler } from '../../../lib/async-handler';
import { successResponse } from '../../../lib/response/success.response';

const router = Router();

router.get(
  '/platform',
  asyncHandler(async (req, res) => {
    const { from, to, granularity } = req.query;
    const report = await adminReportService.generatePlatformReport({ from, to, granularity });
    return successResponse(res, { report });
  }),
);

router.get(
  '/user-growth',
  asyncHandler(async (req, res) => {
    const { from, to, granularity } = req.query;
    const report = await adminReportService.generateUserGrowthReport({ from, to, granularity });
    return successResponse(res, { report });
  }),
);

router.get(
  '/signal-activity',
  asyncHandler(async (req, res) => {
    const { from, to, granularity } = req.query;
    const report = await adminReportService.generateSignalActivityReport({ from, to, granularity });
    return successResponse(res, { report });
  }),
);

router.get(
  '/trade-activity',
  asyncHandler(async (req, res) => {
    const { from, to, granularity } = req.query;
    const report = await adminReportService.generateTradeActivityReport({ from, to, granularity });
    return successResponse(res, { report });
  }),
);

router.get(
  '/revenue',
  asyncHandler(async (req, res) => {
    const { from, to, granularity } = req.query;
    const report = await adminReportService.generateRevenueReport({ from, to, granularity });
    return successResponse(res, { report });
  }),
);

router.get(
  '/referrals',
  asyncHandler(async (req, res) => {
    const { from, to } = req.query;
    const report = await adminReportService.generateReferralReport({ from, to });
    return successResponse(res, { report });
  }),
);

router.get(
  '/export',
  asyncHandler(async (req, res) => {
    const { type, from, to, granularity, format } = req.query;
    const result = await adminReportService.exportReport({ type, from, to, granularity, format });

    if (result.format === 'CSV' && result.csv) {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${type || 'report'}.csv"`);
      return res.send(result.csv);
    }

    return successResponse(res, { report: result.report });
  }),
);

export default router;